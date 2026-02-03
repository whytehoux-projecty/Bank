import { fastify, setupApp } from '../../server';
import { TransactionService } from '../../services/transactionService';

// Mock the Service
jest.mock('../../services/transactionService', () => ({
    TransactionService: {
        getUserTransactions: jest.fn(),
    },
}));

// Mock Database
jest.mock('../../lib/database', () => ({
    __esModule: true,
    default: {
        connect: jest.fn(),
        disconnect: jest.fn(),
        prisma: {
            user: { findUnique: jest.fn() },
        },
        redis: {
            on: jest.fn(),
            connect: jest.fn(),
        }
    },
    connect: jest.fn(),
}));

// Mock Auth Middleware
jest.mock('../../middleware/auth', () => ({
    authenticateToken: jest.fn(async (_req, _reply) => {
        // By default, do nothing (allow)
    }),
}));

// Mock other routes to avoid dependency resolution issues
jest.mock('../../routes/users', () => async () => { });
jest.mock('../../routes/auth', () => async () => { });
jest.mock('../../routes/accounts', () => async () => { });
jest.mock('../../routes/kyc', () => async () => { });
jest.mock('../../routes/wire-transfers', () => async () => { });
jest.mock('../../routes/system', () => async () => { });
jest.mock('../../routes/portal', () => async () => { });
jest.mock('../../routes/bills', () => async () => { });
jest.mock('../../routes/transfers', () => async () => { });
jest.mock('../../routes/admin/verifications', () => async () => { });


import { authenticateToken } from '../../middleware/auth';

// ... (keep previous contents)

describe('Transaction Routes', () => {
    beforeAll(async () => {
        // Setup app but don't listen
        await setupApp();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Default to authenticated
        (authenticateToken as jest.Mock).mockImplementation(async (req, _reply) => {
            req.user = { userId: 'user-123', email: 'test@example.com' };
        });
    });

    it('GET /api/transactions should return 401 if not authenticated', async () => {
        // Override for this test
        (authenticateToken as jest.Mock).mockImplementation(async (_req, reply) => {
            reply.status(401).send({ error: 'Unauthorized' });
        });

        const response = await fastify.inject({
            method: 'GET',
            url: '/api/transactions',
        });

        expect(response.statusCode).toBe(401);
    });

    it('GET /api/transactions should return 200 with data', async () => {
        // Mock service response
        const mockTransactions = { transactions: [], total: 0 };
        (TransactionService.getUserTransactions as jest.Mock).mockResolvedValue(mockTransactions);

        const response = await fastify.inject({
            method: 'GET',
            url: '/api/transactions',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual(mockTransactions);
    });
});
