
import { LoanService } from '../../../../../../UHI Staff Portal /backend/src/modules/finance/loan.service';
import { WebhookService } from '../../../../../../UHI Staff Portal /backend/src/modules/webhook/webhook.service';
import { prisma } from '../../../../../../UHI Staff Portal /backend/src/config/database';

// Mock External Dependencies
jest.mock('../../../../../../UHI Staff Portal /backend/src/config/database', () => ({
  prisma: {
    loan: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    loanInvoice: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loanPayment: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

jest.mock('../../../../../../UHI Staff Portal /backend/src/shared/utils/email', () => ({
  sendEmail: jest.fn(),
}));

describe('Integration Test: Invoice-based Loan Repayment Flow', () => {
  let loanService: LoanService;
  let webhookService: WebhookService;

  beforeEach(() => {
    loanService = new LoanService();
    webhookService = new WebhookService();
    jest.clearAllMocks();
  });

  it('should complete the full cycle: Invoice Generation -> Payment -> Loan Update', async () => {
    // 1. Setup Data
    const userId = 'user-1';
    const loanId = 'loan-1';
    const amountToPay = 500;
    
    const mockUser = { id: userId, staff_id: 'S1', email: 'u@test.com', first_name: 'Test' };
    const mockLoan = { id: loanId, user_id: userId, balance: 1000, status: 'active', amount: 1000 };
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.loan.findFirst as jest.Mock).mockResolvedValue(mockLoan);
    (prisma.loan.findUnique as jest.Mock).mockResolvedValue(mockLoan); // For getLoanById calls
    
    // 2. Generate Invoice
    const invoiceResult = await loanService.generatePaymentInvoice(userId, loanId, amountToPay);
    
    expect(invoiceResult.amounts.total).toBe(500);
    expect(invoiceResult.qrContent).toContain(loanId);
    
    // 3. Simulate "Upload & Payment" in E-Bank (Skipped here, assume success)
    // The E-Bank would call the webhook.
    
    const mockInvoiceRecord = {
      id: 'inv-db-id',
      invoice_number: invoiceResult.invoiceNumber,
      status: 'pending',
      loan_id: loanId,
      loan: mockLoan
    };

    (prisma.loanInvoice.findUnique as jest.Mock).mockResolvedValue(mockInvoiceRecord);
    (prisma.loanInvoice.update as jest.Mock).mockResolvedValue({ ...mockInvoiceRecord, status: 'paid' });
    
    // Mock the loan update return
    (prisma.loan.update as jest.Mock).mockImplementation((args) => {
        // Return updated loan object based on args
        return { ...mockLoan, balance: args.data.balance, status: args.data.status };
    });

    // 4. Webhook Callback
    const webhookPayload = {
      invoiceNumber: invoiceResult.invoiceNumber,
      amount: 500,
      transactionRef: 'TX-BANK-123',
      timestamp: new Date().toISOString()
    };
    
    await webhookService.processPayment(webhookPayload);
    
    // 5. Verify Final State
    expect(prisma.loan.update).toHaveBeenCalledWith({
      where: { id: loanId },
      data: expect.objectContaining({
        balance: 500, // 1000 - 500
        status: 'active'
      })
    });
    
    expect(prisma.loanInvoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-db-id' },
      data: expect.objectContaining({
        status: 'paid',
        payment_transaction_ref: 'TX-BANK-123'
      })
    });
  });
});
