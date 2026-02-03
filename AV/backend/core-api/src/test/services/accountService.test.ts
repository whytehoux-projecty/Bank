import { AccountService } from '../../services/accountService';
import { PrismaClient } from '@prisma/client';
import { cache } from '../../services/cacheService';

// Mock dependencies
const mPrismaClient: any = {
    account: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    transaction: {
        findMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        create: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mPrismaClient)),
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock('../../services/cacheService', () => ({
    cache: {
        get: jest.fn(),
        set: jest.fn(),
    },
    CacheKeys: {
        accountBalance: (id: string) => `account:balance:${id}`,
    },
    CacheTTL: {
        SHORT: 60,
    }
}));

jest.mock('../../shared/index', () => ({
    ERROR_CODES: {
        ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
        USER_NOT_FOUND: 'USER_NOT_FOUND',
    },
    ACCOUNT_CONFIG: {
        ACCOUNT_NUMBER_PREFIX: 'AV',
        CHECKING_INTEREST_RATE: 0.01,
        SAVINGS_INTEREST_RATE: 0.05,
        PREMIUM_INTEREST_RATE: 0.1,
        OVERDRAFT_LIMIT: -100,
    },
    BUSINESS_RULES: {
        MAX_ACCOUNTS_PER_USER: 5,
    }
}));

describe('AccountService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAccountTransactions', () => {
        it('should return transactions with pagination', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({ id: 'acc-1' });
            mPrismaClient.transaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);
            mPrismaClient.transaction.count.mockResolvedValue(1);

            const result = await AccountService.getAccountTransactions('acc-1', 'user-1', {});
            expect(result.transactions).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
        });

        it('should throw error if account not found', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue(null);
            await expect(AccountService.getAccountTransactions('acc-1', 'user-1', {}))
                .rejects.toThrow('ACCOUNT_NOT_FOUND');
        });
    });

    describe('getAccountBalance', () => {
        it('should return cached balance if available', async () => {
            (cache.get as jest.Mock).mockResolvedValue({ balance: 100 });
            const result = await AccountService.getAccountBalance('acc-1', 'user-1');
            expect(result.balance).toBe(100);
            expect(mPrismaClient.account.findFirst).not.toHaveBeenCalled();
        });

        it('should fetch balance from db if not cached', async () => {
            (cache.get as jest.Mock).mockResolvedValue(null);
            mPrismaClient.account.findFirst.mockResolvedValue({
                balance: { toNumber: () => 1000 },
                currency: 'USD'
            });
            mPrismaClient.transaction.aggregate.mockResolvedValue({ _sum: { amount: 100 } });

            const result = await AccountService.getAccountBalance('acc-1', 'user-1');
            expect(result.balance).toBe(1000);
            expect(result.pendingTransactions).toBe(100);
            expect(result.availableBalance).toBe(900);
            expect(cache.set).toHaveBeenCalled();
        });

        it('should throw error if account not found', async () => {
            (cache.get as jest.Mock).mockResolvedValue(null);
            mPrismaClient.account.findFirst.mockResolvedValue(null);
            await expect(AccountService.getAccountBalance('acc-1', 'user-1'))
                .rejects.toThrow('ACCOUNT_NOT_FOUND');
        });
    });

    describe('createAccount', () => {
        const mockAccountData = {
            accountType: 'SAVINGS' as const,
            initialDeposit: 1000
        };

        it('should throw error if user not active', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ status: 'SUSPENDED' });
            await expect(AccountService.createAccount('user-1', mockAccountData))
                .rejects.toThrow('User account is not active');
        });

        it('should throw error if KYC not verified', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                status: 'ACTIVE',
                kycStatus: 'PENDING'
            });
            await expect(AccountService.createAccount('user-1', mockAccountData))
                .rejects.toThrow('KYC verification required');
        });

        it('should throw error if max accounts reached', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                status: 'ACTIVE',
                kycStatus: 'VERIFIED',
                _count: { accounts: 5 }
            });
            await expect(AccountService.createAccount('user-1', mockAccountData))
                .rejects.toThrow('Maximum of 5 accounts allowed');
        });

        it('should create account successfully', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                status: 'ACTIVE',
                kycStatus: 'VERIFIED',
                _count: { accounts: 1 }
            });
            mPrismaClient.account.findUnique.mockResolvedValue(null); // Unique account number check
            mPrismaClient.account.create.mockResolvedValue({ id: 'acc-new', balance: 1000 });

            const result = await AccountService.createAccount('user-1', mockAccountData);
            expect(result).toBeDefined();
            expect(mPrismaClient.account.create).toHaveBeenCalled();
            expect(mPrismaClient.transaction.create).toHaveBeenCalled(); // Initial deposit
        });
    });

    describe('closeAccount', () => {
        it('should throw error if positive balance', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                balance: { toNumber: () => 100 },
                status: 'ACTIVE'
            });
            await expect(AccountService.closeAccount('acc-1', 'user-1'))
                .rejects.toThrow('Cannot close account with positive balance');
        });

        it('should close account if balance is 0', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                balance: { toNumber: () => 0 },
                status: 'ACTIVE'
            });
            mPrismaClient.account.update.mockResolvedValue({ status: 'CLOSED' });

            const result = await AccountService.closeAccount('acc-1', 'user-1');
            expect(result.status).toBe('CLOSED');
        });
    });

    describe('applyInterest', () => {
        it('should apply interest to eligible accounts', async () => {
            mPrismaClient.account.findMany.mockResolvedValue([
                {
                    id: 'acc-1',
                    interestRate: 0.1,
                    balance: 1000 // Annual interest 100, daily ~0.27
                }
            ]);

            const results = await AccountService.applyInterest();
            expect(results).toHaveLength(1);
            expect(mPrismaClient.transaction.create).toHaveBeenCalled(); // Interest deposit
            expect(mPrismaClient.account.update).toHaveBeenCalled(); // Balance update
        });
    });

    // Minimal coverage for other filtering methods
    describe('getAllAccounts', () => {
        it('should return accounts with filters', async () => {
            mPrismaClient.account.findMany.mockResolvedValue([]);
            mPrismaClient.account.count.mockResolvedValue(0);
            const result = await AccountService.getAllAccounts({ search: 'test' });
            expect(result).toBeDefined();
        });
    });

    describe('getAccountSummary', () => {
        it('should return summary', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                dailyLimit: 1000,
                monthlyLimit: 10000
            });
            mPrismaClient.transaction.findMany.mockResolvedValue([]);
            mPrismaClient.transaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });

            const result = await AccountService.getAccountSummary('acc-1', 'user-1');
            expect(result.account).toBeDefined();
            expect(result.spending).toBeDefined();
        });
    });
});
