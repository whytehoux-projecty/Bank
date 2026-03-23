
import Fastify, { FastifyInstance } from 'fastify';
import transactionRoutes from '../../src/routes/transactions';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma: any = {
        account: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        transaction: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(mPrisma)),
    };
    return {
        PrismaClient: jest.fn(() => mPrisma),
        Prisma: {
            Decimal: jest.fn(val => val),
        },
    };
});

describe('Transaction Integration Tests', () => {
    let app: FastifyInstance;
    const mockPrisma = new PrismaClient() as any;

    beforeAll(async () => {
        app = Fastify();

        // Mock Authentication Middleware
        app.decorate('authenticate', async (req: any, _reply: any) => {
            req.user = { userId: 'user-123', role: 'user' };
        });

        // Register Routes
        await app.register(transactionRoutes);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should return list of user transactions', async () => {
            mockPrisma.account.findMany.mockResolvedValue([{ id: 'acc-1' }]);
            mockPrisma.transaction.findMany.mockResolvedValue([
                { id: 'tx-1', amount: 100, type: 'DEPOSIT' }
            ]);
            mockPrisma.transaction.count.mockResolvedValue(1);

            const response = await app.inject({
                method: 'GET',
                url: '/',
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.transactions).toHaveLength(1);
            expect(body.transactions[0].id).toBe('tx-1');
        });

        it('should return empty list if user has no accounts', async () => {
            mockPrisma.account.findMany.mockResolvedValue([]);

            const response = await app.inject({
                method: 'GET',
                url: '/'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.transactions).toHaveLength(0);
        });
    });

    describe('GET /:transactionId', () => {
        it('should return transaction details', async () => {
            mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', amount: 100 });

            const response = await app.inject({
                method: 'GET',
                url: '/tx-1'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.transaction.id).toBe('tx-1');
        });

        it('should return 404 if not found', async () => {
            mockPrisma.transaction.findFirst.mockResolvedValue(null);

            const response = await app.inject({
                method: 'GET',
                url: '/tx-999'
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /deposit', () => {
        it('should create deposit transaction', async () => {
            mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc-1', status: 'ACTIVE' });
            mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-new', type: 'DEPOSIT', amount: 100 });
            mockPrisma.account.update.mockResolvedValue({});

            const response = await app.inject({
                method: 'POST',
                url: '/deposit',
                payload: {
                    accountId: 'acc-1',
                    amount: 100,
                    description: 'Test Deposit'
                }
            });

            expect(response.statusCode).toBe(201);
            expect(mockPrisma.transaction.create).toHaveBeenCalled();
            expect(mockPrisma.account.update).toHaveBeenCalled();
        });

        it('should fail if account not found', async () => {
            mockPrisma.account.findFirst.mockResolvedValue(null);

            const response = await app.inject({
                method: 'POST',
                url: '/deposit',
                payload: {
                    accountId: 'acc-1',
                    amount: 100,
                    description: 'Test Deposit'
                }
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /withdrawal', () => {
        it('should create withdrawal transaction', async () => {
            mockPrisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                status: 'ACTIVE',
                balance: 500,
                dailyLimit: 1000
            });
            mockPrisma.transaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
            mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-w', type: 'WITHDRAWAL', amount: 100 });

            const response = await app.inject({
                method: 'POST',
                url: '/withdrawal',
                payload: {
                    accountId: 'acc-1',
                    amount: 100,
                    description: 'Test Withdrawal'
                }
            });

            expect(response.statusCode).toBe(201);
        });

        it('should fail if insuficient funds', async () => {
            mockPrisma.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                status: 'ACTIVE',
                balance: 50,
                dailyLimit: 1000
            });

            const response = await app.inject({
                method: 'POST',
                url: '/withdrawal',
                payload: {
                    accountId: 'acc-1',
                    amount: 100,
                    description: 'Test Withdrawal'
                }
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Insufficient Funds');
        });
    });

    describe('POST /transfer', () => {
        it('should transfer funds successfully', async () => {
            mockPrisma.account.findFirst
                .mockResolvedValueOnce({ id: 'acc-1', status: 'ACTIVE', balance: 500, userId: 'user-123' }) // From
                .mockResolvedValueOnce({ id: 'acc-2', status: 'ACTIVE' }); // To

            mockPrisma.transaction.create
                .mockResolvedValueOnce({ id: 'tx-d', type: 'TRANSFER' })
                .mockResolvedValueOnce({ id: 'tx-c', type: 'TRANSFER' });

            const response = await app.inject({
                method: 'POST',
                url: '/transfer',
                payload: {
                    fromAccountId: 'acc-1',
                    toAccountId: 'acc-2',
                    amount: 100,
                    description: 'Test Transfer'
                }
            });

            expect(response.statusCode).toBe(201);
            // 2 creates (debit and credit)
            expect(mockPrisma.transaction.create).toHaveBeenCalledTimes(2);
            // 2 updates
            expect(mockPrisma.account.update).toHaveBeenCalledTimes(2);
        });
    });
});
