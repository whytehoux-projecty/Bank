import Fastify, { FastifyInstance } from 'fastify';
import billRoutes from '../../src/routes/bills';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma: any = {
    billPayee: { findFirst: jest.fn() },
    account: { findFirst: jest.fn(), update: jest.fn() },
    transaction: { create: jest.fn() },
    systemConfig: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };
  mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockPrisma));

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: {
      Decimal: jest.fn((v: any) => ({
        toNumber: () => Number(v),
        lt: (other: any) => Number(v) < Number(other),
        minus: (other: any) => Number(v) - Number(other),
      })),
    },
  };
});

// Mock dependencies
jest.mock('../../src/services/invoice-parser.service');
jest.mock('../../src/services/webhook.service');

describe('Payment Failure Scenarios', () => {
  let fastify: FastifyInstance;
  let prismaMock: any;

  beforeAll(async () => {
    fastify = Fastify();
    fastify.decorate('authenticate', async (request: any) => {
      request.user = { userId: 'user-1' };
    });
    await fastify.register(billRoutes);
    await fastify.ready();

    prismaMock = new PrismaClient();
  });

  afterAll(async () => {
    await fastify.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject payment if account balance is insufficient', async () => {
    prismaMock.systemConfig.findUnique.mockResolvedValue({ value: '10000' });
    prismaMock.account.findFirst.mockResolvedValue({
      id: 'acc-1',
      balance: {
        lt: jest.fn(() => true), // Balance < Amount
        toNumber: () => 100,
      },
      currency: 'USD',
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/pay',
      payload: {
        payeeId: 'payee-1',
        amount: 500,
        accountId: 'acc-1',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Insufficient funds');
  });

  it('should require verification if amount exceeds threshold', async () => {
    prismaMock.systemConfig.findUnique.mockResolvedValue({ value: '1000' });

    const response = await fastify.inject({
      method: 'POST',
      url: '/pay',
      payload: {
        payeeId: 'payee-1',
        amount: 2000,
        accountId: 'acc-1',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Verification Required');
    expect(body.requiresVerification).toBe(true);
  });

  it('should reject payment if payee is not found', async () => {
    prismaMock.systemConfig.findUnique.mockResolvedValue({ value: '10000' });
    prismaMock.account.findFirst.mockResolvedValue({
      id: 'acc-1',
      balance: {
        lt: jest.fn(() => false),
        toNumber: () => 5000,
      },
    });
    prismaMock.billPayee.findFirst.mockResolvedValue(null);

    const response = await fastify.inject({
      method: 'POST',
      url: '/pay',
      payload: {
        payeeId: 'invalid-payee',
        amount: 500,
        accountId: 'acc-1',
      },
    });

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).message).toBe('Payee not found');
  });
});
