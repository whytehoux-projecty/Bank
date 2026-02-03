
import Fastify, { FastifyInstance } from 'fastify';
import accountRoutes from '../../src/routes/accounts';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma: any = {
        account: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
            aggregate: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrisma),
        Prisma: {
            Decimal: jest.fn(val => val),
        },
    };
});

describe('Account Integration Tests', () => {
    let app: FastifyInstance;
    const mockPrisma = new PrismaClient() as any;

    beforeAll(async () => {
        app = Fastify();

        // Mock Authentication Middleware
        app.decorate('authenticate', async (req: any, _reply: any) => {
            req.user = { userId: 'user-123', role: 'user' };
        });

        // Register Routes
        await app.register(accountRoutes);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should return list of user accounts', async () => {
            const mockAccounts = [
                {
                    id: 'acc-1',
                    accountNumber: 'AV123',
                    accountType: 'CHECKING',
                    balance: 1000,
                    currency: 'USD',
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            mockPrisma.account.findMany.mockResolvedValue(mockAccounts);

            const response = await app.inject({
                method: 'GET',
                url: '/',
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.accounts).toHaveLength(1);
            expect(body.accounts[0].id).toBe('acc-1');
            expect(mockPrisma.account.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { userId: 'user-123' } })
            );
        });
    });

    describe('GET /:accountId', () => {
        it('should return account details if found', async () => {
            const mockAccount = {
                id: 'acc-1',
                accountNumber: 'AV123',
                userId: 'user-123',
            };
            mockPrisma.account.findFirst.mockResolvedValue(mockAccount);

            const response = await app.inject({
                method: 'GET',
                url: '/acc-1',
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.account.id).toBe('acc-1');
        });

        it('should return 404 if account not found', async () => {
            mockPrisma.account.findFirst.mockResolvedValue(null);

            const response = await app.inject({
                method: 'GET',
                url: '/acc-999',
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe('POST /', () => {
        it('should create a new account', async () => {
            const mockAccount = {
                id: 'acc-new',
                accountNumber: 'CHK123',
                accountType: 'CHECKING',
                balance: 100,
                currency: 'USD',
                status: 'ACTIVE',
            };
            mockPrisma.account.create.mockResolvedValue(mockAccount);

            const response = await app.inject({
                method: 'POST',
                url: '/',
                payload: {
                    accountType: 'CHECKING',
                    currency: 'USD',
                    initialDeposit: 100,
                },
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body.account.id).toBe('acc-new');
            expect(mockPrisma.account.create).toHaveBeenCalled();
            // Should create transaction for initial deposit
            expect(mockPrisma.transaction.create).toHaveBeenCalled();
        });

        it('should fail with invalid input', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/',
                payload: {
                    accountType: 'INVALID_TYPE',
                },
            });
            expect(response.statusCode).toBe(400);
        });
    });

    describe('PATCH /:accountId', () => {
        it('should update account settings', async () => {
            mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc-1', userId: 'user-123' });
            mockPrisma.account.update.mockResolvedValue({ id: 'acc-1', status: 'SUSPENDED' });

            const response = await app.inject({
                method: 'PATCH',
                url: '/acc-1',
                payload: {
                    status: 'SUSPENDED'
                }
            });

            expect(response.statusCode).toBe(200);
            expect(mockPrisma.account.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'acc-1' },
                data: { status: 'SUSPENDED' }
            }));
        });
    });

    describe('GET /:accountId/balance', () => {
        it('should return balance and available balance', async () => {
            mockPrisma.account.findFirst.mockResolvedValue({ balance: 1000, currency: 'USD' });
            mockPrisma.transaction.aggregate.mockResolvedValue({ _sum: { amount: 200 } });

            const response = await app.inject({
                method: 'GET',
                url: '/acc-1/balance'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.balance).toBe(1000);
            expect(body.availableBalance).toBe(800); // 1000 - 200 pending
        });
    });

    describe('GET /:accountId/transactions', () => {
        it('should return paginated transactions', async () => {
            mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc-1' });
            mockPrisma.transaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);
            mockPrisma.transaction.count.mockResolvedValue(1);

            const response = await app.inject({
                method: 'GET',
                url: '/acc-1/transactions?page=1&limit=10'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.transactions).toHaveLength(1);
            expect(body.pagination.total).toBe(1);
        });
    });
});
