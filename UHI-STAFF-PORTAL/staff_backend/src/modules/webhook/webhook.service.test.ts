
import { WebhookService } from './webhook.service';
import { prisma } from '../../config/database';
import crypto from 'crypto';

// Mock Prisma
jest.mock('../../config/database', () => ({
    prisma: {
        loanInvoice: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        loan: {
            update: jest.fn(),
        },
        loanPayment: {
            create: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(prisma)),
        user: {
            findUnique: jest.fn(),
        }
    },
}));

// Mock LoanService
jest.mock('../finance/loan.service', () => ({
    loanService: {
        sendPaymentConfirmationEmail: jest.fn(),
    }
}));

import { loanService } from '../finance/loan.service';

describe('WebhookService', () => {
    let webhookService: WebhookService;
    const mockSecret = 'test-secret';

    beforeEach(() => {
        process.env.WEBHOOK_SECRET = mockSecret;
        webhookService = new WebhookService();
        jest.clearAllMocks();
    });

    describe('verifySignature', () => {
        it('should return true for valid signature', () => {
            const payload = JSON.stringify({ test: 'data' });
            const signature = crypto
                .createHmac('sha256', mockSecret)
                .update(payload)
                .digest('hex');

            const result = webhookService.verifySignature(payload, signature);
            expect(result).toBe(true);
        });

        it('should return false for invalid signature', () => {
            const payload = JSON.stringify({ test: 'data' });
            const signature = 'invalid-signature';

            const result = webhookService.verifySignature(payload, signature);
            expect(result).toBe(false);
        });
    });

    describe('processPayment', () => {
        it('should process payment successfully', async () => {
            const invoiceNumber = 'INV-123';
            const amount = 1000;
            const transactionRef = 'TXN-123';

            const mockInvoice = {
                id: 'inv-1',
                invoice_number: invoiceNumber,
                amount: 1000,
                status: 'generated',
                loan_id: 'loan-1',
                loan: {
                    id: 'loan-1',
                    balance: 5000,
                    user_id: 'user-1'
                }
            };

            const mockUpdatedInvoice = { ...mockInvoice, status: 'paid', payment_transaction_ref: transactionRef };
            const mockLoan = { ...mockInvoice.loan, balance: 4000 };

            (prisma.loanInvoice.findUnique as jest.Mock).mockResolvedValue(mockInvoice);
            (prisma.loanInvoice.update as jest.Mock).mockResolvedValue(mockUpdatedInvoice);
            (prisma.loan.update as jest.Mock).mockResolvedValue(mockLoan);

            const result = await webhookService.processPayment({ invoiceNumber, amount, transactionRef, timestamp: new Date().toISOString() });

            expect(prisma.loanInvoice.findUnique).toHaveBeenCalledWith({
                where: { invoice_number: invoiceNumber },
                include: { loan: true }
            });

            // Check transactions
            expect(prisma.loanInvoice.update).toHaveBeenCalledWith({
                where: { id: mockInvoice.id },
                data: { status: 'paid', paid_at: expect.any(Date), payment_transaction_ref: transactionRef }
            });

            expect(prisma.loan.update).toHaveBeenCalledWith({
                where: { id: mockInvoice.loan_id },
                data: { balance: 4000, status: 'active' }
            });

            expect(prisma.loanPayment.create).toHaveBeenCalledWith({
                data: {
                    loan_id: mockInvoice.loan_id,
                    amount: amount,
                    payment_reference: transactionRef,
                    payment_method: 'aurum_vault_transfer',
                    status: 'confirmed',
                    confirmed_at: expect.any(Date)
                }
            });

            // Check email notification
            expect(loanService.sendPaymentConfirmationEmail).toHaveBeenCalled();
            expect(result).toEqual(mockUpdatedInvoice);
        });

        it('should throw error if invoice not found', async () => {
            (prisma.loanInvoice.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(webhookService.processPayment({ invoiceNumber: 'INV-000', amount: 100, transactionRef: 'TX', timestamp: new Date().toISOString() }))
                .rejects
                .toThrow('Invoice not found');
        });

        it('should return message if invoice already paid', async () => {
            const mockInvoice = {
                id: 'inv-1',
                invoice_number: 'INV-123',
                status: 'paid', // Already paid
            };

            (prisma.loanInvoice.findUnique as jest.Mock).mockResolvedValue(mockInvoice);

            const result = await webhookService.processPayment({ invoiceNumber: 'INV-123', amount: 100, transactionRef: 'TX', timestamp: new Date().toISOString() });
            expect(result).toEqual({ message: 'Invoice already paid', invoice: mockInvoice });
        });

        it('should throw error if amount does not match', async () => {
            const mockInvoice = {
                id: 'inv-1',
                invoice_number: 'INV-123',
                amount: 1000,
                status: 'generated',
            };

            (prisma.loanInvoice.findUnique as jest.Mock).mockResolvedValue(mockInvoice);

            await expect(webhookService.processPayment({ invoiceNumber: 'INV-123', amount: 500, transactionRef: 'TX', timestamp: new Date().toISOString() }))
                .rejects
                .toThrow('Payment amount mismatch');
        });
    });
});
