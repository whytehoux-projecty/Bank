import { LoanService } from '../../services/loan.service';
import { PrismaClient, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';

// Mock dependencies
jest.mock('@prisma/client', () => {
    const mPrismaClient: any = {
        loan: {
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        account: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
        },
        loanRepayment: {
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

jest.mock('pdfkit', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn((event, callback) => {
            if (event === 'end') callback();
            return this;
        }),
        fontSize: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
        font: jest.fn().mockReturnThis(),
        moveTo: jest.fn().mockReturnThis(),
        lineTo: jest.fn().mockReturnThis(),
        stroke: jest.fn().mockReturnThis(),
        end: jest.fn(),
        y: 100,
    }));
});

describe('LoanService', () => {
    let loanService: LoanService;
    let prisma: any;

    beforeEach(() => {
        jest.clearAllMocks();
        loanService = new LoanService();
        // @ts-ignore
        prisma = (loanService as any).prisma;
    });

    describe('createLoan', () => {
        it('should create loan successfully', async () => {
            const params = {
                userId: 'user-1',
                accountId: 'acc-1',
                amount: 1000,
                interestRate: 5,
                termMonths: 12,
                startDate: new Date(),
            };
            prisma.loan.create.mockResolvedValue({ id: 'loan-1', ...params });

            const result = await loanService.createLoan(params);
            expect(result).toBeDefined();
            expect(prisma.loan.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userId: 'user-1',
                    amount: 1000,
                })
            }));
        });
    });

    describe('getLoan', () => {
        it('should return loan with repayments', async () => {
            const mockLoan = { id: 'loan-1', repayments: [] };
            prisma.loan.findFirst.mockResolvedValue(mockLoan);

            const result = await loanService.getLoan('loan-1', 'user-1');
            expect(result).toEqual(mockLoan);
            expect(prisma.loan.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'loan-1', userId: 'user-1' },
                include: { repayments: { orderBy: { paidAt: 'desc' } } }
            }));
        });
    });

    describe('processRepayment', () => {
        const mockParams = {
            loanId: 'loan-1',
            userId: 'user-1',
            amount: 100,
            accountId: 'acc-1',
        };

        it('should throw error if loan not found', async () => {
            prisma.loan.findFirst.mockResolvedValue(null);
            await expect(loanService.processRepayment(mockParams)).rejects.toThrow('Loan not found');
        });

        it('should throw error if loan already paid', async () => {
            prisma.loan.findFirst.mockResolvedValue({ status: 'PAID' });
            await expect(loanService.processRepayment(mockParams)).rejects.toThrow('Loan already paid');
        });

        it('should throw error if account not found', async () => {
            prisma.loan.findFirst.mockResolvedValue({ status: 'ACTIVE' });
            prisma.account.findFirst.mockResolvedValue(null);
            await expect(loanService.processRepayment(mockParams)).rejects.toThrow('Account not found');
        });

        it('should throw error if insufficient funds', async () => {
            prisma.loan.findFirst.mockResolvedValue({ status: 'ACTIVE' });
            prisma.account.findFirst.mockResolvedValue({
                balance: 50 // less than 100
            });
            await expect(loanService.processRepayment(mockParams)).rejects.toThrow('Insufficient funds');
        });

        it('should process repayment successfully', async () => {
            prisma.loan.findFirst.mockResolvedValue({
                id: 'loan-1',
                status: 'ACTIVE',
                remainingAmount: 1000
            });
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: 1000
            });
            prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
            prisma.loanRepayment.create.mockResolvedValue({ id: 'rep-1' });

            const result = await loanService.processRepayment(mockParams);
            expect(result).toBeDefined();
            expect(prisma.transaction.create).toHaveBeenCalled();
            expect(prisma.account.update).toHaveBeenCalled();
            expect(prisma.loanRepayment.create).toHaveBeenCalled();
            expect(prisma.loan.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ remainingAmount: 900 })
            }));
        });

        it('should mark loan as PAID if fully repaid', async () => {
            prisma.loan.findFirst.mockResolvedValue({
                id: 'loan-1',
                status: 'ACTIVE',
                remainingAmount: 100
            });
            prisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                balance: 1000
            });
            prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
            prisma.loanRepayment.create.mockResolvedValue({ id: 'rep-1' });

            await loanService.processRepayment(mockParams);

            expect(prisma.loan.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ remainingAmount: 0, status: 'PAID' })
            }));
        });
    });

    describe('generateHistoryPDF', () => {
        it('should generate PDF buffer', async () => {
            const mockLoan = {
                id: 'loan-1',
                amount: 1000,
                currency: 'USD',
                remainingAmount: 500,
                status: 'ACTIVE',
                startDate: new Date(),
                user: { firstName: 'John', lastName: 'Doe' },
                repayments: [
                    { paidAt: new Date(), amount: 100, currency: 'USD', status: 'COMPLETED' }
                ]
            };
            prisma.loan.findFirst.mockResolvedValue(mockLoan);

            const result = await loanService.generateHistoryPDF('loan-1', 'user-1');
            expect(result).toBeInstanceOf(Buffer);
            expect(PDFDocument).toHaveBeenCalled();
        });

        it('should throw error if loan not found for PDF', async () => {
            prisma.loan.findFirst.mockResolvedValue(null);
            await expect(loanService.generateHistoryPDF('loan-1', 'user-1')).rejects.toThrow('Loan not found');
        });
    });
});
