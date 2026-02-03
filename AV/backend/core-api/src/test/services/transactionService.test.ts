import { TransactionService } from '../../services/transactionService';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
const mPrismaClient: any = {
    account: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        update: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mPrismaClient)),
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock('../../shared/index', () => ({
    TRANSACTION_CONFIG: {
        MIN_AMOUNT: 1,
        MAX_AMOUNT: 1000000,
        DAILY_LIMIT: 10000,
        MONTHLY_LIMIT: 50000,
    },
    BUSINESS_RULES: {
        FRAUD_DETECTION: {
            SUSPICIOUS_AMOUNT_THRESHOLD: 100000,
            VELOCITY_CHECK_WINDOW: 3600000,
            MAX_DAILY_TRANSACTIONS: 100,
        }
    },
    ERROR_CODES: {
        ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
        TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
    }
}));

describe('TransactionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createDeposit', () => {
        const mockDepositData = {
            accountId: 'acc-1',
            amount: 100,
            description: 'Test Deposit',
        };

        it('should throw error if amount below minimum', async () => {
            await expect(TransactionService.createDeposit('user-1', { ...mockDepositData, amount: 0 }))
                .rejects.toThrow('Minimum deposit amount');
        });

        it('should throw error if access denied', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue(null);
            await expect(TransactionService.createDeposit('user-1', mockDepositData))
                .rejects.toThrow('Account not found');
        });

        it('should create deposit successfully', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({ id: 'acc-1', status: 'ACTIVE' });
            mPrismaClient.transaction.create.mockResolvedValue({ id: 'tx-1' });

            const result = await TransactionService.createDeposit('user-1', mockDepositData);
            expect(result).toBeDefined();
            expect(mPrismaClient.account.update).toHaveBeenCalled();
            expect(mPrismaClient.auditLog.create).toHaveBeenCalled();
        });
    });

    describe('createWithdrawal', () => {
        const mockWithdrawalData = {
            accountId: 'acc-1',
            amount: 100,
            description: 'Test Withdrawal',
        };

        it('should throw error if insufficient funds', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                status: 'ACTIVE',
                balance: { toNumber: () => 50 }
            });
            await expect(TransactionService.createWithdrawal('user-1', mockWithdrawalData))
                .rejects.toThrow('Insufficient funds');
        });

        it('should throw error if daily limit exceeded', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                status: 'ACTIVE',
                balance: { toNumber: () => 1000 }
            });
            mPrismaClient.transaction.aggregate.mockResolvedValue({ _sum: { amount: 10000 } }); // Already spent limit
            mPrismaClient.account.findUnique.mockResolvedValue({ dailyLimit: 5000 });

            await expect(TransactionService.createWithdrawal('user-1', mockWithdrawalData))
                .rejects.toThrow('Daily transaction limit exceeded');
        });

        it('should create withdrawal successfully', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                status: 'ACTIVE',
                balance: { toNumber: () => 1000 }
            });
            mPrismaClient.transaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
            mPrismaClient.transaction.count.mockResolvedValue(0);
            mPrismaClient.transaction.create.mockResolvedValue({ id: 'tx-1' });

            const result = await TransactionService.createWithdrawal('user-1', mockWithdrawalData);
            expect(result).toBeDefined();
            expect(mPrismaClient.account.update).toHaveBeenCalled();
        });
    });

    describe('createTransfer', () => {
        const mockTransferData = {
            fromAccountId: 'acc-1',
            toAccountId: 'acc-2',
            amount: 100,
            description: 'Test Transfer',
        };

        it('should throw error if same account', async () => {
            await expect(TransactionService.createTransfer('user-1', {
                ...mockTransferData,
                toAccountId: 'acc-1'
            })).rejects.toThrow('Cannot transfer to the same account');
        });

        it('should throw error if source account not found', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue(null);
            await expect(TransactionService.createTransfer('user-1', mockTransferData))
                .rejects.toThrow('Account not found');
        });

        it('should throw error if destination account not found', async () => {
            // First call finds source, second finds nothing for destination
            mPrismaClient.account.findFirst
                .mockResolvedValueOnce({ id: 'acc-1' })
                .mockResolvedValueOnce(null);

            await expect(TransactionService.createTransfer('user-1', mockTransferData))
                .rejects.toThrow('Destination account not found');
        });

        it('should create transfer successfully', async () => {
            mPrismaClient.account.findFirst
                .mockResolvedValueOnce({ id: 'acc-1', balance: { toNumber: () => 1000 } }) // From
                .mockResolvedValueOnce({ id: 'acc-2', accountNumber: 'B' }); // To

            mPrismaClient.transaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
            mPrismaClient.transaction.count.mockResolvedValue(0);
            mPrismaClient.transaction.create.mockResolvedValue({ id: 'tx-1' }); // Mock tx

            const result = await TransactionService.createTransfer('user-1', mockTransferData);
            expect(result).toHaveLength(2); // Debit and Credit
            expect(mPrismaClient.account.update).toHaveBeenCalledTimes(2);
        });
    });

    describe('getTransactionStats', () => {
        it('should return stats', async () => {
            mPrismaClient.account.findMany.mockResolvedValue([{ id: 'acc-1' }]);

            mPrismaClient.transaction.aggregate.mockResolvedValue({
                _count: { id: 10 },
                _sum: { amount: 1000 }
            });

            mPrismaClient.transaction.groupBy.mockResolvedValue([
                { type: 'DEPOSIT', _count: { id: 5 }, _sum: { amount: 500 } },
                { type: 'WITHDRAWAL', _count: { id: 5 }, _sum: { amount: -500 } },
            ]);

            const stats = await TransactionService.getTransactionStats('user-1');

            expect(stats.totalTransactions).toBe(10);
            expect(stats.deposits).toBe(500);
            expect(stats.withdrawals).toBe(500);
        });
    });
});
