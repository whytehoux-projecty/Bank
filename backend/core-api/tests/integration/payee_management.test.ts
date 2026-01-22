import { describe, it, expect, beforeAll, afterAll, jest, beforeEach } from '@jest/globals';
import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';

// 1. Mock Prisma Client
const mockPrisma: any = {
  billPayee: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  };
});

// 2. Mock BillService
const mockBillService: any = {
  getVerificationThreshold: jest.fn(),
  processPayment: jest.fn(),
  processVerifiedPayment: jest.fn(),
};

jest.mock('../../src/services/bill.service', () => {
  return {
    BillService: jest.fn().mockImplementation(() => mockBillService),
  };
});

// 3. Mock InvoiceParserService
const mockInvoiceParser: any = {
  parse: jest.fn(),
};

jest.mock('../../src/services/invoice-parser.service', () => {
  return {
    InvoiceParserService: jest.fn().mockImplementation(() => mockInvoiceParser),
  };
});

// Import routes (must be after mocks)
import billRoutes from '../../src/routes/bills';

describe('Payee Management & Bill Payment Integration', () => {
  let app: FastifyInstance;
  const mockUserId = 'user-123';

  beforeAll(async () => {
    app = Fastify();

    // Register multipart for file uploads
    await app.register(multipart);

    // Mock Authentication Middleware
    app.decorate('authenticate', async (request: any, _reply: any) => {
      // Simulate authenticated user
      request.user = { userId: mockUserId };
    });

    // Register Routes
    await app.register(billRoutes, { prefix: '/api/v1/bills' });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /payees', () => {
    it('should return a list of payees', async () => {
      const mockPayees = [{ id: '1', name: 'Electric Co', userId: mockUserId }];
      mockPrisma.billPayee.findMany.mockResolvedValue(mockPayees);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bills/payees',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).payees).toEqual(mockPayees);
      expect(mockPrisma.billPayee.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.billPayee.findMany.mockRejectedValue(new Error('DB Error'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bills/payees',
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload)).toEqual({
        error: 'Internal Server Error',
        message: 'Failed to fetch payees',
      });
    });
  });

  describe('POST /payees', () => {
    const validPayee = {
      name: 'Water Co',
      accountNumber: 'ACC-WATER-99',
      category: 'UTILITIES',
    };

    it('should create a new payee successfully', async () => {
      mockPrisma.billPayee.create.mockResolvedValue({ id: '2', ...validPayee, userId: mockUserId });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/payees',
        payload: validPayee,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.message).toBe('Payee added');
      expect(body.payee.name).toBe(validPayee.name);
      expect(mockPrisma.billPayee.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          ...validPayee,
        },
      });
    });

    it('should return 400 for validation errors', async () => {
      const invalidPayee = { ...validPayee, name: '' }; // Empty name

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/payees',
        payload: invalidPayee,
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload).error).toBe('Validation Error');
    });

    it('should handle database errors during creation', async () => {
      mockPrisma.billPayee.create.mockRejectedValue(new Error('DB Error'));

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/payees',
        payload: validPayee,
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload).message).toBe('Failed to add payee');
    });
  });

  describe('POST /pay', () => {
    const paymentPayload = {
      payeeId: 'payee-1',
      amount: 100,
      accountId: 'acc-1',
      reference: 'INV-001',
    };

    it('should process payment successfully', async () => {
      mockBillService.processPayment.mockResolvedValue({
        success: true,
        message: 'Payment successful',
        transaction: { id: 'tx-1' },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay',
        payload: paymentPayload,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual({
        message: 'Payment successful',
        transaction: { id: 'tx-1' },
      });
    });

    it('should return 400 if verification is required', async () => {
      mockBillService.processPayment.mockResolvedValue({
        success: false,
        requiresVerification: true,
        threshold: 5000,
        error: 'Verification required',
        message: 'Amount exceeds limit',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay',
        payload: { ...paymentPayload, amount: 6000 },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.requiresVerification).toBe(true);
      expect(body.threshold).toBe(5000);
    });

    it('should return 404 if account or payee not found', async () => {
      mockBillService.processPayment.mockResolvedValue({
        success: false,
        error: 'Account not found',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay',
        payload: paymentPayload,
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload).message).toBe('Account not found');
    });

    it('should return 400 for general payment failures', async () => {
      mockBillService.processPayment.mockResolvedValue({
        success: false,
        error: 'Insufficient funds',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay',
        payload: paymentPayload,
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload).message).toBe('Insufficient funds');
    });

    it('should handle service errors', async () => {
      mockBillService.processPayment.mockRejectedValue(new Error('Service Error'));

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay',
        payload: paymentPayload,
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload).message).toBe('Failed to process payment');
    });

    it('should return 400 for validation errors', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay',
        payload: { ...paymentPayload, amount: -100 }, // Invalid amount
      });
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload).error).toBe('Validation Error');
    });
  });

  describe('GET /config/verification', () => {
    it('should return verification threshold', async () => {
      mockBillService.getVerificationThreshold.mockResolvedValue(5000);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bills/config/verification',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).threshold).toBe(5000);
    });

    it('should return default threshold on error', async () => {
      mockBillService.getVerificationThreshold.mockRejectedValue(new Error('Config Error'));

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/bills/config/verification',
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload).threshold).toBe(10000);
    });
  });

  describe('POST /pay-verified', () => {
    it('should process verified payment with file', async () => {
      mockBillService.processVerifiedPayment.mockResolvedValue({
        success: true,
        message: 'Verified payment initiated',
        transaction: { id: 'tx-ver-1' },
      });

      const boundary = '--------------------------testboundary';
      const payload = `--${boundary}\r
Content-Disposition: form-data; name="payeeId"\r
\r
payee-1\r
--${boundary}\r
Content-Disposition: form-data; name="amount"\r
\r
6000\r
--${boundary}\r
Content-Disposition: form-data; name="accountId"\r
\r
acc-1\r
--${boundary}\r
Content-Disposition: form-data; name="document"; filename="proof.pdf"\r
Content-Type: application/pdf\r
\r
%PDF-1.4 mock content\r
--${boundary}--`;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay-verified',
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        payload: payload,
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return 404 if account not found', async () => {
      mockBillService.processVerifiedPayment.mockResolvedValue({
        success: false,
        error: 'Account not found',
      });

      const boundary = '--------------------------testboundary';
      const payload = `--${boundary}\r\nContent-Disposition: form-data; name="payeeId"\r\n\r\npayee-1\r\n--${boundary}\r\nContent-Disposition: form-data; name="amount"\r\n\r\n6000\r\n--${boundary}\r\nContent-Disposition: form-data; name="accountId"\r\n\r\nacc-1\r\n--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="proof.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4 mock content\r\n--${boundary}--`;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay-verified',
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        payload,
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload).message).toBe('Account not found');
    });

    it('should return 400 for general errors', async () => {
      mockBillService.processVerifiedPayment.mockResolvedValue({
        success: false,
        error: 'General Error',
      });

      const boundary = '--------------------------testboundary';
      const payload = `--${boundary}\r
Content-Disposition: form-data; name="payeeId"\r
\r
payee-1\r
--${boundary}\r
Content-Disposition: form-data; name="amount"\r
\r
6000\r
--${boundary}\r
Content-Disposition: form-data; name="accountId"\r
\r
acc-1\r
--${boundary}\r
Content-Disposition: form-data; name="document"; filename="proof.pdf"\r
Content-Type: application/pdf\r
\r
%PDF-1.4 mock content\r
--${boundary}--`;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay-verified',
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        payload,
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload).message).toBe('General Error');
    });

    it('should handle service errors', async () => {
      mockBillService.processVerifiedPayment.mockRejectedValue(new Error('Service Error'));

      const boundary = '--------------------------testboundary';
      const payload = `--${boundary}\r\nContent-Disposition: form-data; name="payeeId"\r\n\r\npayee-1\r\n--${boundary}\r\nContent-Disposition: form-data; name="amount"\r\n\r\n6000\r\n--${boundary}\r\nContent-Disposition: form-data; name="accountId"\r\n\r\nacc-1\r\n--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="proof.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4 mock content\r\n--${boundary}--`;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/pay-verified',
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        payload,
      });

      expect(response.statusCode).toBe(500);
    });
  });

  describe('POST /upload-invoice', () => {
    it('should upload and parse invoice successfully', async () => {
      const mockParsed = { invoiceNumber: 'INV-123', amount: 500 };
      mockInvoiceParser.parse.mockResolvedValue(mockParsed);

      const boundary = '--------------------------testboundary';
      const payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="invoice.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4 mock content\r\n--${boundary}--`;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/upload-invoice',
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        payload,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.payload)).toEqual({ success: true, data: mockParsed });
    });

    it('should return 400 if no file uploaded', async () => {
      const boundary = '--------------------------testboundary';
      const payload = `--${boundary}--`;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/upload-invoice',
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        payload,
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload).message).toBe('No file uploaded');
    });

    it('should return 400 for non-pdf files', async () => {
      const boundary = '--------------------------testboundary';
      const payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="invoice.txt"\r\nContent-Type: text/plain\r\n\r\ntext content\r\n--${boundary}--`;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/upload-invoice',
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        payload,
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload).message).toBe('Only PDF files are allowed');
    });

    it('should handle parser errors', async () => {
      mockInvoiceParser.parse.mockRejectedValue(new Error('Parse Error'));

      const boundary = '--------------------------testboundary';
      const payload = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="invoice.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4 mock content\r\n--${boundary}--`;

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bills/upload-invoice',
        headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
        payload,
      });

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.payload).message).toBe('Failed to process invoice');
    });
  });
});
