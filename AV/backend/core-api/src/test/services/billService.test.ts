import { BillService } from '../../services/bill.service';
import { PrismaClient, Prisma } from '@prisma/client';
import { WebhookService } from '../../services/webhook.service';

// Mock dependencies
jest.mock('@prisma/client', () => {
    const mPrismaClient: any = {
        systemConfig: {
            findUnique: jest.fn(),
        },
        account: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        billPayee: {
            findFirst: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
        },
        paymentVerification: {
            create: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(mPrismaClient)),
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
        Prisma: {
            Decimal: jest.fn((val) => ({
                toNumber: () => Number(val),
                lt: (other: number) => Number(val) < other,
            })),
        }
    };
});

jest.mock('../../services/webhook.service');

describe('BillService', () => {
    let billService: BillService;
    let prisma: any;
    let webhookService: any;

    beforeEach(() => {
        jest.clearAllMocks();
        billService = new BillService();
        // @ts-ignore
        prisma = (billService as any).prisma;
        // @ts-ignore
        webhookService = (billService as any).webhookService;
    });

    describe('getVerificationThreshold', () => {
        it('should return configured threshold', async () => {
            prisma.systemConfig.findUnique.mockResolvedValue({ value: '5000' });
            const result = await billService.getVerificationThreshold();
            expect(result).toBe(5000);
            expect(prisma.systemConfig.findUnique).toHaveBeenCalledWith({ where: { key: 'payment_verification_threshold' } });
        });

        it('should return default threshold if config missing', async () => {
            prisma.systemConfig.findUnique.mockResolvedValue(null);
            const result = await billService.getVerificationThreshold();
            expect(result).toBe(10000);
        });
    });

    describe('processPayment', () => {
        const mockParams = {
            userId: 'user-1',
            payeeId: 'payee-1',
            amount: 100,
            accountId: 'acc-1',
            reference: 'REF123',
        };

        it('should require verification if amount > threshold', async () => {
            // Threshold 0 for test
            prisma.systemConfig.findUnique.mockResolvedValue({ value: '50' });

            const result = await billService.processPayment(mockParams);
            expect(result.success).toBe(false);
            expect(result.requiresVerification).toBe(true);
            expect(result.threshold).toBe(50);
        });

        it('should return error if account not found', async () => {
            prisma.systemConfig.findUnique.mockResolvedValue({ value: '10000' });
            prisma.account.findFirst.mockResolvedValue(null);

            const result = await billService.processPayment(mockParams);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Account not found');
        });

        it('should return error if insufficient funds', async () => {
            prisma.systemConfig.findUnique.mockResolvedValue({ value: '10000' });
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: { lt: () => true }, // Mock lt returning true
            });

            const result = await billService.processPayment(mockParams);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Insufficient funds');
        });

        it('should return error if payee not found', async () => {
            prisma.systemConfig.findUnique.mockResolvedValue({ value: '10000' });
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: { lt: () => false },
                currency: 'USD'
            });
            prisma.billPayee.findFirst.mockResolvedValue(null);

            const result = await billService.processPayment(mockParams);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Payee not found');
        });

        it('should process payment successfully and send webhook if INV reference', async () => {
            prisma.systemConfig.findUnique.mockResolvedValue({ value: '10000' });
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: { lt: () => false },
                currency: 'USD'
            });
            prisma.billPayee.findFirst.mockResolvedValue({
                id: 'payee-1',
                category: 'UTILITIES',
                name: 'Electric Co'
            });
            prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });

            const paramsWithInvoice = { ...mockParams, reference: 'INV-123' };
            const result = await billService.processPayment(paramsWithInvoice);

            expect(result.success).toBe(true);
            expect(prisma.account.update).toHaveBeenCalled();
            expect(prisma.transaction.create).toHaveBeenCalled();
            expect(webhookService.sendPaymentNotification).toHaveBeenCalledWith(expect.objectContaining({
                invoiceNumber: 'INV-123',
                amount: 100,
                transactionRef: 'tx-1'
            }));
        });

        it('should process payment successfully without webhook if not INV reference', async () => {
            prisma.systemConfig.findUnique.mockResolvedValue({ value: '10000' });
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: { lt: () => false },
                currency: 'USD'
            });
            prisma.billPayee.findFirst.mockResolvedValue({
                id: 'payee-1',
                category: 'UTILITIES',
                name: 'Electric Co'
            });
            prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });

            const result = await billService.processPayment(mockParams);

            expect(result.success).toBe(true);
            expect(webhookService.sendPaymentNotification).not.toHaveBeenCalled();
        });
    });

    describe('processVerifiedPayment', () => {
        const mockParams = {
            userId: 'user-1',
            payeeId: 'payee-1',
            amount: 100,
            accountId: 'acc-1',
            documentPath: 'path/to/doc.pdf',
        };

        it('should return error for invalid amount', async () => {
            const result = await billService.processVerifiedPayment({ ...mockParams, amount: -10 });
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid amount');
        });

        it('should return error if account not found', async () => {
            prisma.account.findFirst.mockResolvedValue(null);
            const result = await billService.processVerifiedPayment(mockParams);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Account not found');
        });

        it('should return error if insufficient funds', async () => {
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: { lt: () => true },
            });
            const result = await billService.processVerifiedPayment(mockParams);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Insufficient funds');
        });

        it('should return error if payee not found', async () => {
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: { lt: () => false },
                currency: 'USD'
            });
            prisma.billPayee.findFirst.mockResolvedValue(null);
            const result = await billService.processVerifiedPayment(mockParams);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Payee not found');
        });

        it('should create pending verification transaction', async () => {
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: { lt: () => false },
                currency: 'USD'
            });
            prisma.billPayee.findFirst.mockResolvedValue({
                name: 'Payee',
                category: 'Test'
            });
            prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });

            const result = await billService.processVerifiedPayment(mockParams);

            expect(result.success).toBe(true);
            expect(prisma.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
                status: 'PENDING_VERIFICATION'
            }));
            expect(prisma.paymentVerification.create).toHaveBeenCalledWith(expect.objectContaining({
                transactionId: 'tx-1',
                documentPath: 'path/to/doc.pdf'
            }));
        });
    });
});
