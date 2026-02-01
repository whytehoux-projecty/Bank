import { WebhookService } from '../../src/modules/webhook/webhook.service';
import { prisma } from '../../src/config/database';
import { AppError } from '../../src/shared/middleware/errorHandler.middleware';

// Mock Data Store
const mockDb: any = {
  loans: [],
  invoices: [],
  payments: []
};

// Mock Prisma
jest.mock('../../src/config/database', () => ({
  prisma: {
    loanInvoice: {
      findUnique: jest.fn(async ({ where, include }) => {
        const invoice = mockDb.invoices.find((i: any) => i.invoice_number === where.invoice_number);
        if (!invoice) return null;
        
        if (include?.loan) {
          const loan = mockDb.loans.find((l: any) => l.id === invoice.loan_id);
          return { ...invoice, loan };
        }
        return invoice;
      }),
      update: jest.fn(async ({ where, data }) => {
        const index = mockDb.invoices.findIndex((i: any) => i.id === where.id);
        if (index === -1) throw new Error('Invoice not found');
        mockDb.invoices[index] = { ...mockDb.invoices[index], ...data };
        return mockDb.invoices[index];
      })
    },
    loan: {
      update: jest.fn(async ({ where, data }) => {
        const index = mockDb.loans.findIndex((l: any) => l.id === where.id);
        if (index === -1) throw new Error('Loan not found');
        mockDb.loans[index] = { ...mockDb.loans[index], ...data };
        return mockDb.loans[index];
      })
    },
    loanPayment: {
      create: jest.fn(async ({ data }) => {
        const payment = { ...data, id: `pay-${Date.now()}` };
        mockDb.payments.push(payment);
        return payment;
      })
    },
    $transaction: jest.fn(async (callback) => {
      // Pass the mocked prisma object
      return await callback(require('../../src/config/database').prisma);
    })
  }
}));

// Mock LoanService for email
jest.mock('../../src/modules/finance/loan.service', () => ({
  loanService: {
    sendPaymentConfirmationEmail: jest.fn().mockResolvedValue(true)
  }
}));

describe('Webhook Integration Tests', () => {
  let webhookService: WebhookService;
  
  beforeAll(() => {
    webhookService = new WebhookService();
  });

  beforeEach(() => {
    // Reset Mock DB
    mockDb.loans = [];
    mockDb.invoices = [];
    mockDb.payments = [];
    jest.clearAllMocks();
  });

  it('should successfully process a valid payment', async () => {
    // Setup Data
    const loanId = 'loan-123';
    const invoiceId = 'inv-456';
    const invoiceNumber = 'INV-2024-001';
    
    mockDb.loans.push({
      id: loanId,
      user_id: 'user-1',
      balance: 5000,
      status: 'active'
    });

    mockDb.invoices.push({
      id: invoiceId,
      loan_id: loanId,
      invoice_number: invoiceNumber,
      amount: 500,
      status: 'pending'
    });

    // Execute
    const payload = {
      invoiceNumber: invoiceNumber,
      amount: 500,
      transactionRef: 'TX-AURUM-789',
      timestamp: new Date().toISOString()
    };

    const result: any = await webhookService.processPayment(payload);

    // Assertions
    expect(result.status).toBe('paid');
    expect(result.payment_transaction_ref).toBe('TX-AURUM-789');

    // Check DB State
    const updatedLoan = mockDb.loans.find((l: any) => l.id === loanId);
    expect(updatedLoan.balance).toBe(4500); // 5000 - 500
    expect(updatedLoan.status).toBe('active');

    const updatedInvoice = mockDb.invoices.find((i: any) => i.id === invoiceId);
    expect(updatedInvoice.status).toBe('paid');

    expect(mockDb.payments.length).toBe(1);
    expect(mockDb.payments[0].amount).toBe(500);
    expect(mockDb.payments[0].payment_reference).toBe('TX-AURUM-789');
  });

  it('should handle loan payoff correctly', async () => {
    // Setup Data - Loan balance equals payment amount
    const loanId = 'loan-payoff';
    const invoiceNumber = 'INV-PAYOFF';
    
    mockDb.loans.push({
      id: loanId,
      user_id: 'user-2',
      balance: 1000,
      status: 'active'
    });

    mockDb.invoices.push({
      id: 'inv-payoff',
      loan_id: loanId,
      invoice_number: invoiceNumber,
      amount: 1000,
      status: 'pending'
    });

    // Execute
    await webhookService.processPayment({
      invoiceNumber: invoiceNumber,
      amount: 1000,
      transactionRef: 'TX-FINAL',
      timestamp: new Date().toISOString()
    });

    // Check DB State
    const updatedLoan = mockDb.loans.find((l: any) => l.id === loanId);
    expect(updatedLoan.balance).toBe(0);
    expect(updatedLoan.status).toBe('paid_off');
  });

  it('should throw error for non-existent invoice', async () => {
    const payload = {
      invoiceNumber: 'INV-MISSING',
      amount: 500,
      transactionRef: 'TX-FAIL',
      timestamp: new Date().toISOString()
    };

    await expect(webhookService.processPayment(payload))
      .rejects
      .toThrow(AppError);
  });

  it('should handle idempotency (already paid invoice)', async () => {
    const loanId = 'loan-idem';
    const invoiceNumber = 'INV-IDEM';
    
    mockDb.loans.push({
      id: loanId,
      balance: 5000,
      status: 'active'
    });

    mockDb.invoices.push({
      id: 'inv-idem',
      loan_id: loanId,
      invoice_number: invoiceNumber,
      amount: 500,
      status: 'paid' // Already paid
    });

    const result = await webhookService.processPayment({
      invoiceNumber: invoiceNumber,
      amount: 500,
      transactionRef: 'TX-REPEAT',
      timestamp: new Date().toISOString()
    });

    // Should return with message, not throw
    expect(result).toHaveProperty('message', 'Invoice already paid');
    
    // Balance should NOT decrease further
    const loan = mockDb.loans.find((l: any) => l.id === loanId);
    expect(loan.balance).toBe(5000);
  });

  it('should verify valid HMAC signature', () => {
    const secret = 'default-secret-change-me';
    const payload = { test: 'data' };
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    const validSignature = hmac.update(JSON.stringify(payload)).digest('hex');

    expect(webhookService.verifySignature(payload, validSignature)).toBe(true);
  });

  it('should reject invalid HMAC signature', () => {
    const payload = { test: 'data' };
    const invalidSignature = 'invalid-hex-string';

    expect(webhookService.verifySignature(payload, invalidSignature)).toBe(false);
  });
});
