
import { WebhookService } from '../../../../../../UHI Staff Portal /backend/src/modules/webhook/webhook.service';
import { prisma } from '../../../../../../UHI Staff Portal /backend/src/config/database';

// Mock Prisma
jest.mock('../../../../../../UHI Staff Portal /backend/src/config/database', () => ({
  prisma: {
    loanInvoice: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loan: {
      update: jest.fn(),
    },
    loanPayment: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

// Mock Email
jest.mock('../../../../../../UHI Staff Portal /backend/src/shared/utils/email', () => ({
  sendEmail: jest.fn(),
}));

describe('Webhook Service - Signature Verification & Processing', () => {
  let webhookService: WebhookService;
  const secret = 'default-secret-change-me';

  beforeEach(() => {
    webhookService = new WebhookService();
    jest.clearAllMocks();
  });

  it('should return true for valid signature', () => {
    const payload = { event: 'payment.success', amount: 100 };
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(JSON.stringify(payload)).digest('hex');

    const isValid = webhookService.verifySignature(payload, signature);
    expect(isValid).toBe(true);
  });

  it('should process valid payment and update loan balance', async () => {
    const data = {
      invoiceNumber: 'INV-123',
      amount: 500,
      transactionRef: 'TX-999',
      timestamp: new Date().toISOString()
    };

    const mockInvoice = {
      id: 'inv-1',
      invoice_number: 'INV-123',
      status: 'pending',
      loan_id: 'loan-1',
      loan: {
        id: 'loan-1',
        user_id: 'user-1',
        balance: 1000,
        status: 'active'
      }
    };

    (prisma.loanInvoice.findUnique as jest.Mock).mockResolvedValue(mockInvoice);
    (prisma.loanInvoice.update as jest.Mock).mockResolvedValue({ ...mockInvoice, status: 'paid' });
    (prisma.loan.update as jest.Mock).mockResolvedValue({});

    await webhookService.processPayment(data);

    // Verify Invoice Update
    expect(prisma.loanInvoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: expect.objectContaining({
        status: 'paid',
        payment_transaction_ref: 'TX-999'
      })
    });

    // Verify Loan Balance Update
    expect(prisma.loan.update).toHaveBeenCalledWith({
      where: { id: 'loan-1' },
      data: expect.objectContaining({
        balance: 500, // 1000 - 500
        status: 'active'
      })
    });
  });
});
