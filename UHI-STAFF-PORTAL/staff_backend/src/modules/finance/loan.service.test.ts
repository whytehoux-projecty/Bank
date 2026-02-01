
import { LoanService } from './loan.service';
import { prisma } from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
    prisma: {
        loan: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
        loanInvoice: {
            create: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(prisma)),
    },
}));

describe('LoanService', () => {
    let loanService: LoanService;

    beforeEach(() => {
        loanService = new LoanService();
        jest.clearAllMocks();
    });

    describe('generatePaymentInvoice', () => {
        it('should generate an invoice with correct calculations', async () => {
            const userId = 'user-123';
            const loanId = 'loan-123';
            const amount = 1000;

            const mockLoan = {
                id: loanId,
                user_id: userId,
                balance: 5000,
                currency: 'USD',
                status: 'active',
            };

            const mockUser = {
                id: userId,
                first_name: 'John',
                last_name: 'Doe',
            };

            (prisma.loan.findFirst as jest.Mock).mockResolvedValue(mockLoan);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (prisma.loanInvoice.count as jest.Mock).mockResolvedValue(0);

            const expectedInvoice = {
                id: 'invoice-123',
                invoice_number: 'INV-2024001',
                amount: 1000,
                principal_amount: 1000,
                tax_amount: 0,
                fee_amount: 0,
                status: 'generated',
            };

            (prisma.loanInvoice.create as jest.Mock).mockResolvedValue(expectedInvoice);

            const result = await loanService.generatePaymentInvoice(userId, loanId, amount);

            expect(prisma.loan.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: loanId, user_id: userId },
            }));
            expect(prisma.loanInvoice.create).toHaveBeenCalled();
            expect(result).toEqual(expect.objectContaining({
                invoiceNumber: expect.any(String),
                amounts: {
                    principal: 1000,
                    tax: 0,
                    fee: 0,
                    total: 1000
                },
                loan: expect.objectContaining({
                    id: loanId,
                    balance: 5000
                }),
                staff: expect.objectContaining({
                    name: "John Doe"
                })
            }));
        });

        it('should throw error if amount exceeds balance', async () => {
            const userId = 'user-123';
            const loanId = 'loan-123';
            const amount = 6000;

            const mockLoan = {
                id: loanId,
                user_id: userId,
                balance: 5000,
                currency: 'USD',
                status: 'active',
            };

            (prisma.loan.findFirst as jest.Mock).mockResolvedValue(mockLoan);

            await expect(loanService.generatePaymentInvoice(userId, loanId, amount))
                .rejects
                .toThrow(/exceed.*balance/i);
        });

        it('should throw error if loan is not active', async () => {
            const userId = 'user-123';
            const loanId = 'loan-123';
            const amount = 100;

            const mockLoan = {
                id: loanId,
                user_id: userId,
                balance: 5000,
                currency: 'USD',
                status: 'pending', // Not active
            };

            (prisma.loan.findFirst as jest.Mock).mockResolvedValue(mockLoan);

            await expect(loanService.generatePaymentInvoice(userId, loanId, amount))
                .rejects
                .toThrow('Can only generate invoice for active loans');
        });
    });
});
