import { FastifyInstance } from 'fastify';
import { setupApp } from '../../server';
import { AccountService } from '../../services/accountService';
import { ERROR_CODES } from '../../shared/index';

// Mock AccountService
jest.mock('../../services/accountService', () => ({
    AccountService: {
        getUserAccounts: jest.fn(),
        getAccountById: jest.fn(),
        createAccount: jest.fn(),
        updateAccount: jest.fn(),
        getAccountBalance: jest.fn(),
        getAccountTransactions: jest.fn(),
    },
}));

// Mock Database
jest.mock('../../lib/database', () => ({
    __esModule: true,
    default: {
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        healthCheck: jest.fn().mockResolvedValue({ database: 'connected', cache: 'disconnected' }),
        prisma: {
            account: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            user: {
                findUnique: jest.fn()
            },
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
        },
        redis: {
            on: jest.fn(),
            connect: jest.fn().mockResolvedValue(undefined),
            isOpen: false,
        }
    },
    db: {
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        healthCheck: jest.fn().mockResolvedValue({ database: 'connected', cache: 'disconnected' }),
        prisma: {
            account: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            user: {
                findUnique: jest.fn()
            },
            $connect: jest.fn().mockResolvedValue(undefined),
            $disconnect: jest.fn().mockResolvedValue(undefined),
        },
        redis: {
            on: jest.fn(),
            connect: jest.fn().mockResolvedValue(undefined),
            isOpen: false,
        }
    },
}));

// Mock Auth Middleware
jest.mock('../../middleware/auth', () => ({
    authenticateToken: jest.fn((req, _reply) => {
        req.user = { userId: 'user-123', email: 'test@example.com' };
        return Promise.resolve();
    }),
}));

// Mock other routes
jest.mock('../../routes/transactions', () => async () => { });
jest.mock('../../routes/auth', () => async () => { });
jest.mock('../../routes/users', () => async () => { });
jest.mock('../../routes/kyc', () => async () => { });
jest.mock('../../routes/wire-transfers', () => async () => { });
jest.mock('../../routes/system', () => async () => { });
jest.mock('../../routes/portal', () => async () => { });
jest.mock('../../routes/bills', () => async () => { });
jest.mock('../../routes/transfers', () => async () => { });
jest.mock('../../routes/admin/verifications', () => async () => { });

describe('Account Routes', () => {
    let fastify: FastifyInstance;

    beforeAll(async () => {
        fastify = await setupApp();
    }, 30000);

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. GET /api/accounts
    describe('GET /api/accounts', () => {
        it('should return 200 and list of accounts', async () => {
            const mockAccounts = [{ id: 'acc-1', accountNumber: 'AV123' }];
            (AccountService.getUserAccounts as jest.Mock).mockResolvedValue(mockAccounts);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/accounts',
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({ accounts: mockAccounts });
            expect(AccountService.getUserAccounts).toHaveBeenCalledWith('user-123');
        });
    });

    // 2. GET /api/accounts/:accountId
    describe('GET /api/accounts/:accountId', () => {
        it('should return 200 and account details', async () => {
            const mockAccount = { id: 'acc-1', accountNumber: 'AV123' };
            (AccountService.getAccountById as jest.Mock).mockResolvedValue(mockAccount);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/accounts/acc-1',
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({ account: mockAccount });
            expect(AccountService.getAccountById).toHaveBeenCalledWith('acc-1', 'user-123');
        });

        it('should return 404 if account not found', async () => {
            (AccountService.getAccountById as jest.Mock).mockRejectedValue(new Error(ERROR_CODES.ACCOUNT_NOT_FOUND));

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/accounts/acc-999',
            });

            expect(response.statusCode).toBe(404);
        });
    });

    // 3. POST /api/accounts
    describe('POST /api/accounts', () => {
        it('should create account successfully', async () => {
            const mockAccount = { id: 'acc-1', status: 'ACTIVE' };
            (AccountService.createAccount as jest.Mock).mockResolvedValue(mockAccount);

            const response = await fastify.inject({
                method: 'POST',
                url: '/api/accounts',
                payload: {
                    accountType: 'SAVINGS',
                    initialDeposit: 1000
                }
            });

            expect(response.statusCode).toBe(201);
            expect(JSON.parse(response.payload)).toEqual({
                message: 'Account created successfully',
                account: mockAccount
            });
            expect(AccountService.createAccount).toHaveBeenCalledWith('user-123', {
                accountType: 'SAVINGS',
                initialDeposit: 1000
            });
        });

        it('should return 404 if user not found (during creation check)', async () => {
            (AccountService.createAccount as jest.Mock).mockRejectedValue(new Error(ERROR_CODES.USER_NOT_FOUND));

            const response = await fastify.inject({
                method: 'POST',
                url: '/api/accounts',
                payload: { accountType: 'CHECKING' }
            });

            expect(response.statusCode).toBe(404);
        });
    });

    // 4. PATCH /api/accounts/:accountId
    describe('PATCH /api/accounts/:accountId', () => {
        it('should update account successfully', async () => {
            const mockAccount = { id: 'acc-1', dailyLimit: 5000 };
            (AccountService.updateAccount as jest.Mock).mockResolvedValue(mockAccount);

            const response = await fastify.inject({
                method: 'PATCH',
                url: '/api/accounts/acc-1',
                payload: { dailyLimit: 5000 }
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({
                message: 'Account updated successfully',
                account: mockAccount
            });
            expect(AccountService.updateAccount).toHaveBeenCalledWith('acc-1', 'user-123', { dailyLimit: 5000 });
        });
    });

    // 5. GET /api/accounts/:accountId/balance
    describe('GET /api/accounts/:accountId/balance', () => {
        it('should return account balance', async () => {
            const mockBalance = { balance: 1000, availableBalance: 900, pendingTransactions: 100, currency: 'USD' };
            (AccountService.getAccountBalance as jest.Mock).mockResolvedValue(mockBalance);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/accounts/acc-1/balance'
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual(mockBalance);
        });
    });

    // 6. GET /api/accounts/:accountId/transactions
    describe('GET /api/accounts/:accountId/transactions', () => {
        it('should return transactions', async () => {
            const mockResult = { transactions: [], pagination: { page: 1, total: 0 } };
            (AccountService.getAccountTransactions as jest.Mock).mockResolvedValue(mockResult);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/accounts/acc-1/transactions?page=1&limit=10'
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual(mockResult);
            expect(AccountService.getAccountTransactions).toHaveBeenCalledWith('acc-1', 'user-123', {
                page: 1,
                limit: 10,
                type: undefined,
                status: undefined
            });
        });
    });
});
