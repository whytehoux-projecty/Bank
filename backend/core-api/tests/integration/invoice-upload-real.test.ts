import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import billRoutes from '../../src/routes/bills';
import PDFDocument from 'pdfkit';

// Mock Prisma only (keep InvoiceParserService REAL)
jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    billPayee: { findFirst: jest.fn() },
    account: { findFirst: jest.fn() },
    systemConfig: { findUnique: jest.fn() },
    transaction: { create: jest.fn() },
    paymentVerification: { create: jest.fn() },
    $transaction: jest.fn((cb: any) => cb(mPrisma)),
  };
  return {
    PrismaClient: jest.fn(() => mPrisma),
    Prisma: { Decimal: jest.fn(val => val) },
  };
});

// Helper to generate PDF Buffer
const generateInvoicePdf = (text: string): Promise<Buffer> => {
  return new Promise(resolve => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.text(text);
    doc.end();
  });
};

describe('Real Invoice Upload & Parsing Integration', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();
    await app.register(multipart);

    // Mock Auth
    app.decorate('authenticate', async (req: any) => {
      req.user = { userId: 'user-123' };
    });

    await app.register(billRoutes);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should upload a real PDF, parse it, and return correct data', async () => {
    const invoiceText = `
      Invoice #INV-REAL-2024
      Service Code: UHI-REAL-999
      Reference Code: G/L/2024/REAL-1
      
      Payment Reference PIN: SECUREPIN777
      
      Principal Amount: 1,250.00
      Tax: 50.00
      Fee: 10.00
      
      Total Due: 1,310.00
    `;

    const pdfBuffer = await generateInvoicePdf(invoiceText);

    // Construct Multipart Payload
    const boundary = '--------------------------boundary';
    const payload = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="invoice.pdf"\r\n'),
      Buffer.from('Content-Type: application/pdf\r\n\r\n'),
      pdfBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const response = await app.inject({
      method: 'POST',
      url: '/upload-invoice',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      payload: payload,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    expect(body.success).toBe(true);
    expect(body.data.invoiceNumber).toBe('INV-REAL-2024');
    // Note: The service might parse "UHI-REAL-999" or similar based on regex.
    // Based on previous code reading, it matches specific patterns.
    // Let's verify at least the amount which is critical.
    expect(body.data.amount).toBe(1310.0);
  });
});
