import { Request, Response, NextFunction } from 'express';
import { LoanStatus } from '@prisma/client';
import { loanService } from './loan.service';

export class LoanController {
    // ============ STAFF ENDPOINTS ============

    /**
     * GET /finance/loans - Get user's loans
     */
    async getUserLoans(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const loans = await loanService.getUserLoans(userId);
            res.json({ success: true, data: loans });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /finance/loans/:id - Get loan details
     */
    async getLoanById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const loan = await loanService.getLoanById(userId, id);
            res.json({ success: true, data: loan });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /finance/loans - Apply for a new loan
     */
    async applyForLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const loan = await loanService.applyForLoan(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Loan application submitted successfully',
                data: loan
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /finance/loans/:id/cancel - Cancel loan application
     */
    async cancelLoanApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const loan = await loanService.cancelLoanApplication(userId, id);
            res.json({ success: true, message: 'Loan application cancelled', data: loan });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /finance/loans/:id/payment - Record a payment
     */
    async recordPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const loan = await loanService.recordPayment(userId, {
                loan_id: id,
                ...req.body
            });
            res.json({ success: true, message: 'Payment recorded', data: loan });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /finance/loans/:id/invoice - Generate payment invoice
     */
    async generateInvoice(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const { amount } = req.body;
            const invoice = await loanService.generatePaymentInvoice(userId, id, Number(amount));
            res.json({ success: true, data: invoice });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /finance/loans/:id/pay - Initiate Stripe Payment
     */
    async initiatePayment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const { amount } = req.body;

            if (!amount) {
                res.status(400).json({ success: false, message: 'Amount is required' });
                return;
            }

            const result = await loanService.initiateStripePayment(userId, id, Number(amount));
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /finance/loans/:id/history/pdf - Download loan history PDF
     */
    async downloadHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const pdfBuffer = await loanService.getLoanHistoryPDF(userId, id);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="loan_history_${id}.pdf"`);
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    // ============ ADMIN ENDPOINTS ============

    /**
     * GET /admin/loans - Get all loans
     */
    async getAllLoans(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, search } = req.query;
            const loans = await loanService.getAllLoans({
                status: status as LoanStatus | undefined,
                search: search as string | undefined,
            });
            res.json({ success: true, data: loans });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /admin/loans/stats - Get loan statistics
     */
    async getLoanStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await loanService.getLoanStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /admin/loans/:id - Get loan details
     */
    async getLoanDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const loan = await loanService.getLoanDetails(id);
            res.json({ success: true, data: loan });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /admin/loans/:id - Update loan
     */
    async updateLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const loan = await loanService.updateLoan(id, req.body);
            res.json({ success: true, message: 'Loan updated successfully', data: loan });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /admin/loans/:id/approve - Approve loan
     */
    async approveLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.user!.id;
            const { id } = req.params;
            const loan = await loanService.approveLoan(id, adminId);
            res.json({ success: true, message: 'Loan approved', data: loan });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /admin/loans/:id/reject - Reject loan
     */
    async rejectLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.user!.id;
            const { id } = req.params;
            const { reason } = req.body;
            const loan = await loanService.rejectLoan(id, adminId, reason);
            res.json({ success: true, message: 'Loan rejected', data: loan });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /admin/loans/:id/activate - Activate approved loan
     */
    async activateLoan(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const loan = await loanService.activateLoan(id);
            res.json({ success: true, message: 'Loan activated', data: loan });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /admin/loans/bulk-approve - Bulk approve loans
     */
    async bulkApprove(req: Request, res: Response, next: NextFunction) {
        try {
            const adminId = req.user!.id;
            const { loanIds } = req.body;
            const results = await loanService.bulkApproveLoan(loanIds, adminId);
            res.json({ success: true, message: 'Bulk approval completed', data: results });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /admin/loans/send-reminders - Send payment reminders
     */
    async sendReminders(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await loanService.sendPaymentReminders();
            res.json({
                success: true,
                message: `Sent ${result.totalReminders} payment reminders`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export const loanController = new LoanController();
