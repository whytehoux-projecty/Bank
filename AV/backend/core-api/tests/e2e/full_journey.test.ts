import Fastify, { FastifyInstance } from 'fastify';
import billRoutes from '../../src/routes/bills';
import multipart from '@fastify/multipart';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

// Mock Axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    billPayee: { findFirst: jest.fn(), findMany: jest.fn() },
    account: { findFirst: jest.fn(), update: jest.fn() },
    transaction: { create: jest.fn() },
    systemConfig: { findUnique: jest.fn() },
    paymentVerification: { create: jest.fn() },
    $transaction: jest.fn((cb: any) =>
      cb({
        account: { update: jest.fn() },
        transaction: { create: jest.fn().mockResolvedValue({ id: 'tx-1', reference: 'INV-E2E-2024' }) },
        paymentVerification: { create: jest.fn() },
        auditLog: { create: jest.fn() }
      })
    ),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: { Decimal: jest.fn((v: any) => ({
      toNumber: () => Number(v),
      lt: (other: any) => Number(v) < Number(other),
      minus: (other: any) => Number(v) - Number(other)
    })) },
  };
});

describe('E2E: Full Payment Journey with Webhook', () => {
  let fastify: FastifyInstance;
  let prismaMock: any;

  const generateInvoicePdf = (text: string): Promise<Buffer> => {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.text(text);
      doc.end();
    });
  };

  beforeAll(async () => {
    fastify = Fastify();
    fastify.decorate('authenticate', async (request: any) => {
      request.user = { userId: 'user-1' };
    });
    await fastify.register(multipart);
    await fastify.register(billRoutes);
    await fastify.ready();
    
    prismaMock = new PrismaClient();
    mockedAxios.post.mockResolvedValue({ status: 200, data: { success: true } });
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should upload invoice, parse it, and pay it with webhook notification', async () => {
    // 1. Generate PDF
    const invoiceText = `
      Invoice #INV-E2E-2024
      Service Code: UHI-SERVICE
      Reference Code: LOAN-REF-999
      Total Due: 1,200.50
    `;
    const pdfBuffer = await generateInvoicePdf(invoiceText);

    // 2. Upload Invoice
    const boundary = '--------------------------boundary';
    const payload = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="invoice.pdf"\r\n'),
      Buffer.from('Content-Type: application/pdf\r\n\r\n'),
      pdfBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const uploadRes = await fastify.inject({
      method: 'POST',
      url: '/upload-invoice',
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
      payload: payload,
    });

    expect(uploadRes.statusCode).toBe(200);
    const parsedData = JSON.parse(uploadRes.body).data;
    expect(parsedData.invoiceNumber).toBe('INV-E2E-2024');
    expect(parsedData.amount).toBe(1200.50);

    // 3. Setup Payment Mock Data
    prismaMock.billPayee.findFirst.mockResolvedValue({ id: 'payee-uhi', name: 'UHI Finance', category: 'LOAN_REPAYMENT' });
    prismaMock.account.findFirst.mockResolvedValue({
      id: 'acc-main',
      balance: {
        lt: jest.fn(() => false),
        toNumber: () => 50000,
      },
      currency: 'USD',
    });
    prismaMock.systemConfig.findUnique.mockResolvedValue({ value: '100000' }); // High threshold

    // 4. Submit Payment
    const payRes = await fastify.inject({
      method: 'POST',
      url: '/pay',
      payload: {
        payeeId: 'payee-uhi',
        amount: parsedData.amount,
        accountId: 'acc-main',
        reference: parsedData.invoiceNumber,
      },
    });

    expect(payRes.statusCode).toBe(200);
    expect(JSON.parse(payRes.body).message).toBe('Payment successful');

    // 5. Verify Webhook
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('webhook'),
      expect.objectContaining({
        invoiceNumber: 'INV-E2E-2024',
        amount: 1200.50,
      }),
      expect.any(Object)
    );
  });
});
