import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import billRoutes from '../../src/routes/bills';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    billPayee: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    systemConfig: {
      findUnique: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    paymentVerification: {
      create: jest.fn(),
    },
  };
  mPrisma.$transaction = jest.fn((callback: any) => callback(mPrisma));

  return {
    PrismaClient: jest.fn(() => mPrisma),
    Prisma: {
      Decimal: jest.fn(val => val),
    },
  };
});

// Mock Invoice Parser
jest.mock('../../src/services/invoice-parser.service', () => {
  return {
    InvoiceParserService: jest.fn().mockImplementation(() => ({
      parse: jest.fn().mockResolvedValue({
        invoiceNumber: 'INV-MOCK',
        amount: 500,
        paymentPin: 'PIN123',
        serviceCode: 'SVC',
        accountCode: 'ACC',
        breakdown: { principal: 500, tax: 0, fee: 0 },
      }),
    })),
  };
});

describe('Bill Payment Integration Tests', () => {
  let app: FastifyInstance;
  // Get access to the mock instance
  // Since PrismaClient is a mock returning the SAME object (defined in factory),
  // we can get it by instantiating it.
  const mockPrisma = new PrismaClient() as any;

  beforeAll(async () => {
    app = Fastify();

    // Register Multipart
    await app.register(multipart);

    // Mock Authentication Middleware
    app.decorate('authenticate', async (req: any, _reply: any) => {
      req.user = { userId: 'user-123', role: 'user' };
    });

    // Register Routes
    await app.register(billRoutes);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /upload-invoice', () => {
    it('should parse uploaded PDF invoice', async () => {
      // Create a dummy PDF buffer
      const buffer = Buffer.from('%PDF-1.4 ... dummy content');

      const payload = `--boundary\r
Content-Disposition: form-data; name="file"; filename="invoice.pdf"\r
Content-Type: application/pdf\r
\r
${buffer}\r
--boundary--\r
`;

      const response = await app.inject({
        method: 'POST',
        url: '/upload-invoice',
        headers: {
          'content-type': 'multipart/form-data; boundary=boundary',
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.invoiceNumber).toBe('INV-MOCK');
    });
  });

  describe('POST /pay', () => {
    it('should process payment under threshold', async () => {
      // Setup Mocks
      mockPrisma.systemConfig.findUnique.mockResolvedValue({
        key: 'payment_verification_threshold',
        value: '1000',
      });
      mockPrisma.account.findFirst.mockResolvedValue({
        id: 'acc-1',
        balance: { lt: (amt: number) => 2000 < amt }, // Mock balance check
        currency: 'USD',
      });
      mockPrisma.billPayee.findFirst.mockResolvedValue({
        id: 'payee-1',
        name: 'Test Payee',
        category: 'Utilities',
      });
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-1', status: 'COMPLETED' });

      const response = await app.inject({
        method: 'POST',
        url: '/pay',
        payload: {
          payeeId: 'payee-1',
          amount: 500,
          accountId: 'acc-1',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });

    it('should require verification for payment over threshold', async () => {
      mockPrisma.systemConfig.findUnique.mockResolvedValue({
        key: 'payment_verification_threshold',
        value: '1000',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/pay',
        payload: {
          payeeId: 'payee-1',
          amount: 1500,
          accountId: 'acc-1',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Verification Required');
      expect(body.requiresVerification).toBe(true);
    });
  });

  describe('POST /pay-verified', () => {
    it('should process verified payment', async () => {
      mockPrisma.account.findFirst.mockResolvedValue({
        id: 'acc-1',
        balance: { lt: (amt: number) => 2000 < amt },
        currency: 'USD',
      });
      mockPrisma.billPayee.findFirst.mockResolvedValue({ id: 'payee-1', name: 'Test Payee' });
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'tx-1',
        status: 'PENDING_VERIFICATION',
        reference: 'REF123',
      });

      const buffer = Buffer.from('dummy pdf');

      const payload = `--boundary\r
Content-Disposition: form-data; name="file"; filename="proof.pdf"\r
Content-Type: application/pdf\r
\r
${buffer}\r
--boundary\r
Content-Disposition: form-data; name="payeeId"\r
\r
payee-1\r
--boundary\r
Content-Disposition: form-data; name="amount"\r
\r
1500\r
--boundary\r
Content-Disposition: form-data; name="accountId"\r
\r
acc-1\r
--boundary--\r
`;

      const response = await app.inject({
        method: 'POST',
        url: '/pay-verified',
        headers: {
          'content-type': 'multipart/form-data; boundary=boundary',
        },
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.transaction.status).toBe('PENDING_VERIFICATION');
      expect(mockPrisma.paymentVerification.create).toHaveBeenCalled();
    });
  });
});
