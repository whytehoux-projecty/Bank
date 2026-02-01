import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler.middleware';
import { sendEmail } from '../../shared/utils/email';
import { generateLoanHistoryPDF } from '../../shared/utils/pdfGenerator';
import { stripeService } from '../../shared/services/stripe.service';

import { LoanStatus } from '@prisma/client';

// Interfaces
interface CreateLoanInput {
    amount: number;
    purpose: string;
    term: number; // months
    reason?: string;
}

interface UpdateLoanInput {
    amount?: number;
    balance?: number;
    monthly_payment?: number;
    interest_rate?: number;
    start_date?: Date;
    due_date?: Date;
    status?: LoanStatus;
    admin_notes?: string;
}

interface LoanPaymentInput {
    loan_id: string;
    amount: number;
    payment_reference: string;
    payment_method?: string;
}

export class LoanService {
    // ============ STAFF METHODS ============

    /**
     * Get all loans for a user
     */
    async getUserLoans(userId: string) {
        return prisma.loan.findMany({
            where: { user_id: userId },
            orderBy: [{ status: 'asc' }, { created_at: 'desc' }]
        });
    }

    /**
     * Get loan by ID for a user
     */
    async getLoanById(userId: string, loanId: string) {
        const loan = await prisma.loan.findFirst({
            where: { id: loanId, user_id: userId },
            include: {
                payments: {
                    orderBy: { created_at: 'desc' }
                },
                invoices: {
                    orderBy: { generated_at: 'desc' }
                }
            }
        });

        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        return loan;
    }

    /**
     * Generate Loan History PDF
     */
    async getLoanHistoryPDF(userId: string, loanId: string) {
        const loan = await this.getLoanById(userId, loanId); // Includes payments
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) throw new AppError('User not found', 404);

        return generateLoanHistoryPDF({
            user,
            loan,
            payments: loan.payments
        });
    }

    /**
     * Send payment confirmation email
     */
    async sendPaymentConfirmationEmail(
        userId: string,
        details: { amount: number; reference: string; loanId: string; newBalance: number }
    ) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.email) return;

        const subject = 'Payment Received - Loan Repayment';
        const html = `
      <h2>Payment Receipt</h2>
      <p>Dear ${user.first_name},</p>
      <p>We have received a payment for your loan.</p>
      <p><strong>Transaction Details:</strong></p>
      <ul>
        <li>Loan Reference: ${details.loanId}</li>
        <li>Amount Paid: $${Number(details.amount).toLocaleString()}</li>
        <li>Transaction Ref: ${details.reference}</li>
        <li>Date: ${new Date().toLocaleDateString()}</li>
      </ul>
      <p><strong>Status:</strong></p>
      <ul>
        <li>Remaining Balance: $${Number(details.newBalance).toLocaleString()}</li>
      </ul>
      <p>Thank you for your timely payment.</p>
      <p>Best regards,<br>HR Department</p>
    `;

        try {
            await sendEmail({ to: user.email, subject, html });
        } catch (error) {
            console.error('Failed to send payment confirmation email:', error);
        }
    }

    /**
     * Apply for a new loan
     */
    async applyForLoan(userId: string, data: CreateLoanInput) {
        // Calculate monthly payment with simple interest
        const interestRate = 0.05; // 5% annual interest
        const totalWithInterest = data.amount * (1 + (interestRate * data.term / 12));
        const monthlyPayment = totalWithInterest / data.term;

        const loan = await prisma.loan.create({
            data: {
                user_id: userId,
                amount: data.amount,
                balance: data.amount,
                currency: 'USD',
                reason: data.reason || data.purpose,
                status: 'pending',
                repayment_months: data.term,
                monthly_payment: monthlyPayment,
                interest_rate: interestRate * 100,
            }
        });

        // Get user for email notification
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
            await this.sendLoanApplicationEmail(user.email, user.first_name, loan);
        }

        return loan;
    }

    /**
     * Cancel a pending loan application
     */
    async cancelLoanApplication(userId: string, loanId: string) {
        const loan = await this.getLoanById(userId, loanId);

        if (loan.status !== 'pending') {
            throw new AppError('Only pending loans can be cancelled', 400);
        }

        return prisma.loan.update({
            where: { id: loanId },
            data: { status: 'rejected' }
        });
    }

    /**
     * Record a loan payment (for payment tracking)
     */
    async recordPayment(userId: string, data: LoanPaymentInput) {
        const loan = await this.getLoanById(userId, data.loan_id);

        if (loan.status !== 'active') {
            throw new AppError('Can only make payments on active loans', 400);
        }

        if (data.amount > Number(loan.balance)) {
            throw new AppError('Payment amount exceeds outstanding balance', 400);
        }

        const newBalance = Number(loan.balance) - data.amount;

        // Update loan balance
        const updatedLoan = await prisma.loan.update({
            where: { id: data.loan_id },
            data: {
                balance: newBalance,
                status: newBalance <= 0 ? 'paid_off' : 'active',
                last_payment_date: new Date(),
            }
        });

        // Create payment record
        await prisma.loanPayment.create({
            data: {
                loan_id: data.loan_id,
                amount: data.amount,
                payment_reference: data.payment_reference,
                payment_method: data.payment_method || 'bank_transfer',
                status: 'pending', // Will be verified by admin
            }
        });

        return updatedLoan;
    }

    /**
     * Generate payment invoice data
     */
    async generatePaymentInvoice(userId: string, loanId: string, amount: number) {
        const loan = await this.getLoanById(userId, loanId);
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (loan.status !== 'active') {
            throw new AppError('Can only generate invoice for active loans', 400);
        }

        if (amount <= 0 || amount > Number(loan.balance)) {
            throw new AppError('Invalid payment amount. Must be positive and not exceed balance.', 400);
        }


        const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
        const paymentPin = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Calculations (Example logic)
        // In a real scenario, fetch these from a config service
        const taxRate = 0.0; // 0% tax for now
        const processingFee = 0.0; // Flat fee or %

        const principal = amount;
        const tax = principal * taxRate;
        const totalAmount = principal + tax + processingFee;

        // QR Code Data
        // Format: SERVICE_CODE|STAFF_ID-LOAN_CODE|ACCOUNT_NUMBER
        // Using "UHI-2134" as service code from requirements
        // Account: "G/L/{YEAR}/{LOAN_CODE}"
        const serviceCode = "UHI-2134";
        const year = new Date().getFullYear();
        const accountCode = `G/L/${year}/${loan.id.split('-').pop()}`; // taking last part of UUID for brevity or use full ID

        const qrContent = `${serviceCode}|${user.staff_id}-${loan.id}|${accountCode}`;

        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        // Persist Invoice
        await prisma.loanInvoice.create({
            data: {
                loan_id: loanId,
                invoice_number: invoiceNumber,
                payment_pin: paymentPin,
                principal_amount: principal,
                tax_amount: tax,
                fee_amount: processingFee,
                amount: totalAmount,
                qr_code_data: qrContent,
                due_date: dueDate,
                status: 'pending',
                generated_by: userId
            }
        });

        return {
            invoiceNumber,
            paymentPin,
            qrContent,
            accountCode,
            serviceCode,
            amounts: {
                principal,
                tax,
                fee: processingFee,
                total: totalAmount
            },
            loan: {
                id: loan.id,
                reason: loan.reason,
                totalAmount: loan.amount, // Decimal
                balance: loan.balance,     // Decimal
                paymentAmount: Math.min(amount, Number(loan.balance)),
            },
            staff: {
                name: `${user.first_name} ${user.last_name}`,
                staffId: user.staff_id,
                email: user.email,
            },
            bankDetails: {
                accountName: 'Global Organization Staff Fund',
                bankName: 'First National Bank',
                accountNumber: '1234567890',
                routingNumber: '021000089',
                swiftCode: 'FNBKUS33XXX',
            },
            dueDate,
            generatedAt: new Date(),
        };
    }

    // ============ ADMIN METHODS ============

    /**
     * Get all loans (admin)
     */
    async getAllLoans(filters?: { status?: LoanStatus; search?: string }) {
        const where: Record<string, unknown> = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.search) {
            where.OR = [
                { user: { first_name: { contains: filters.search, mode: 'insensitive' } } },
                { user: { last_name: { contains: filters.search, mode: 'insensitive' } } },
                { user: { staff_id: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }

        return prisma.loan.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        staff_id: true,
                        email: true,
                    }
                }
            },
            orderBy: [{ status: 'asc' }, { created_at: 'desc' }]
        });
    }

    /**
     * Get loan details (admin)
     */
    async getLoanDetails(loanId: string) {
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: {
                user: true,
                payments: {
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        return loan;
    }

    /**
     * Approve a loan (admin)
     */
    async approveLoan(loanId: string, adminId: string) {
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: { user: true }
        });

        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        if (loan.status !== 'pending') {
            throw new AppError('Only pending loans can be approved', 400);
        }

        // Calculate due date based on term
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (loan.repayment_months || 12));

        const updatedLoan = await prisma.loan.update({
            where: { id: loanId },
            data: {
                status: 'approved',
                approved_by: adminId,
                approved_at: new Date(),
                due_date: dueDate,
            }
        });

        // Send approval email
        if (loan.user?.email) {
            await this.sendLoanApprovalEmail(loan.user.email, loan.user.first_name, updatedLoan);
        }

        return updatedLoan;
    }

    /**
     * Reject a loan (admin)
     */
    async rejectLoan(loanId: string, adminId: string, reason?: string) {
        const loan = await prisma.loan.findUnique({
            where: { id: loanId },
            include: { user: true }
        });

        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        if (loan.status !== 'pending') {
            throw new AppError('Only pending loans can be rejected', 400);
        }

        const updatedLoan = await prisma.loan.update({
            where: { id: loanId },
            data: {
                status: 'rejected',
                rejected_by: adminId,
                rejection_reason: reason,
            }
        });

        // Send rejection email
        if (loan.user?.email) {
            await this.sendLoanRejectionEmail(loan.user.email, loan.user.first_name, reason);
        }

        return updatedLoan;
    }

    /**
     * Update loan details (admin)
     */
    async updateLoan(loanId: string, data: UpdateLoanInput) {
        const loan = await prisma.loan.findUnique({ where: { id: loanId } });

        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        return prisma.loan.update({
            where: { id: loanId },
            data: {
                amount: data.amount,
                balance: data.balance,
                monthly_payment: data.monthly_payment,
                interest_rate: data.interest_rate,
                start_date: data.start_date,
                due_date: data.due_date,
                status: data.status,
                admin_notes: data.admin_notes,
            }
        });
    }

    /**
     * Activate an approved loan (admin)
     */
    async activateLoan(loanId: string) {
        const loan = await prisma.loan.findUnique({ where: { id: loanId } });

        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        if (loan.status !== 'approved') {
            throw new AppError('Only approved loans can be activated', 400);
        }

        return prisma.loan.update({
            where: { id: loanId },
            data: {
                status: 'active',
                start_date: new Date(),
            }
        });
    }

    /**
     * Get loan statistics (admin)
     */
    async getLoanStats() {
        const [
            pendingCount,
            activeCount,
            completedCount,
            totalOutstanding,
            totalDisbursed,
        ] = await Promise.all([
            prisma.loan.count({ where: { status: 'pending' } }),
            prisma.loan.count({ where: { status: 'active' } }),
            prisma.loan.count({ where: { status: 'paid_off' } }),
            prisma.loan.aggregate({
                where: { status: 'active' },
                _sum: { balance: true }
            }),
            prisma.loan.aggregate({
                where: { status: { in: ['active', 'paid_off'] } },
                _sum: { amount: true }
            }),
        ]);

        const totalCollected = Number(totalDisbursed._sum.amount || 0) - Number(totalOutstanding._sum.balance || 0);

        return {
            pending: pendingCount,
            active: activeCount,
            paidOff: completedCount,
            totalOutstanding: Number(totalOutstanding._sum.balance || 0),
            totalDisbursed: Number(totalDisbursed._sum.amount || 0),
            totalCollected,
        };
    }

    /**
     * Bulk approve loans (admin)
     */
    async bulkApproveLoan(loanIds: string[], adminId: string) {
        const results = await Promise.all(
            loanIds.map(id => this.approveLoan(id, adminId).catch(e => ({ id, error: e.message })))
        );
        return results;
    }

    /**
     * Send payment reminders for overdue loans (admin)
     */
    async sendPaymentReminders() {
        const overdueLoans = await prisma.loan.findMany({
            where: {
                status: 'active',
                due_date: { lt: new Date() }
            },
            include: { user: true }
        });

        const results = await Promise.all(
            overdueLoans.map(async loan => {
                if (loan.user?.email) {
                    await this.sendPaymentReminderEmail(loan.user.email, loan.user.first_name, loan);
                    return { loanId: loan.id, sent: true };
                }
                return { loanId: loan.id, sent: false };
            })
        );

        return {
            totalReminders: results.filter(r => r.sent).length,
            results,
        };
    }

    // ============ EMAIL METHODS ============

    private async sendLoanApplicationEmail(email: string, firstName: string, loan: { id: string; amount: unknown }) {
        const subject = 'Loan Application Received';
        const html = `
      <h2>Loan Application Submitted</h2>
      <p>Dear ${firstName},</p>
      <p>Your loan application has been received and is pending review.</p>
      <p><strong>Loan Details:</strong></p>
      <ul>
        <li>Reference: ${loan.id}</li>
        <li>Amount Requested: $${Number(loan.amount).toLocaleString()}</li>
      </ul>
      <p>You will be notified once your application has been reviewed.</p>
      <p>Best regards,<br>HR Department</p>
    `;

        try {
            await sendEmail({ to: email, subject, html });
        } catch (error) {
            console.error('Failed to send loan application email:', error);
        }
    }

    private async sendLoanApprovalEmail(email: string, firstName: string, loan: { id: string; amount: unknown; due_date: Date | null }) {
        const subject = 'Loan Application Approved';
        const html = `
      <h2>Congratulations! Your Loan Has Been Approved</h2>
      <p>Dear ${firstName},</p>
      <p>We are pleased to inform you that your loan application has been approved.</p>
      <p><strong>Loan Details:</strong></p>
      <ul>
        <li>Reference: ${loan.id}</li>
        <li>Approved Amount: $${Number(loan.amount).toLocaleString()}</li>
        <li>Repayment Due Date: ${loan.due_date?.toLocaleDateString() || 'TBD'}</li>
      </ul>
      <p>Please log in to your Staff Portal to view complete details and payment information.</p>
      <p>Best regards,<br>HR Department</p>
    `;

        try {
            await sendEmail({ to: email, subject, html });
        } catch (error) {
            console.error('Failed to send loan approval email:', error);
        }
    }

    private async sendLoanRejectionEmail(email: string, firstName: string, reason?: string) {
        const subject = 'Loan Application Status Update';
        const html = `
      <h2>Loan Application Update</h2>
      <p>Dear ${firstName},</p>
      <p>We regret to inform you that your loan application has not been approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you have any questions, please contact the HR department.</p>
      <p>Best regards,<br>HR Department</p>
    `;

        try {
            await sendEmail({ to: email, subject, html });
        } catch (error) {
            console.error('Failed to send loan rejection email:', error);
        }
    }

    private async sendPaymentReminderEmail(email: string, firstName: string, loan: { id: string; balance: unknown; due_date: Date | null }) {
        const subject = 'Payment Reminder - Staff Loan';
        const html = `
      <h2>Loan Payment Reminder</h2>
      <p>Dear ${firstName},</p>
      <p>This is a friendly reminder that your loan payment is due.</p>
      <p><strong>Loan Details:</strong></p>
      <ul>
        <li>Reference: ${loan.id}</li>
        <li>Outstanding Balance: $${Number(loan.balance).toLocaleString()}</li>
        <li>Due Date: ${loan.due_date?.toLocaleDateString() || 'Overdue'}</li>
      </ul>
      <p>Please log in to your Staff Portal to make a payment or generate a payment invoice.</p>
      <p>If you have already made this payment, please disregard this reminder.</p>
      <p>Best regards,<br>HR Department</p>
    `;

        try {
            await sendEmail({ to: email, subject, html });
        } catch (error) {
            console.error('Failed to send payment reminder email:', error);
        }
    }

    // ============ PAYMENT INTEGRATIONS ============

    /**
     * Initiate Stripe Payment
     */
    async initiateStripePayment(userId: string, loanId: string, amount: number) {
        const loan = await this.getLoanById(userId, loanId);

        if (loan.status !== 'active') {
            throw new AppError('Can only make payments on active loans', 400);
        }

        // Fetch user explicitly to ensure we have details
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        const paymentIntent = await stripeService.createPaymentIntent(amount, loan.currency, {
            loanId: loan.id,
            userId: userId,
            staffId: user.staff_id,
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: amount,
            currency: loan.currency
        };
    }
}

export const loanService = new LoanService();
