import { LoanService } from '../../src/modules/finance/loan.service';
import { prisma } from '../../src/config/database';

// Mock Prisma with In-Memory State
const mockDb: any = {
  loans: [],
  invoices: [],
};

jest.mock('../../src/config/database', () => ({
  prisma: {
    loan: {
      create: jest.fn(async ({ data }) => {
        const loan = { ...data, id: `loan-${Date.now()}`, created_at: new Date(), payments: [], invoices: [] };
        mockDb.loans.push(loan);
        return loan;
      }),
      findUnique: jest.fn(async ({ where }) => {
        const loan = mockDb.loans.find((l: any) => l.id === where.id);
        return loan ? { ...loan, user: { email: 'test@example.com', first_name: 'Test' } } : null;
      }),
      findFirst: jest.fn(async ({ where }) => {
        // Simplified findFirst
        return mockDb.loans.find((l: any) => l.id === where.id) || null;
      }),
      update: jest.fn(async ({ where, data }) => {
        const index = mockDb.loans.findIndex((l: any) => l.id === where.id);
        if (index === -1) throw new Error('Loan not found');
        mockDb.loans[index] = { ...mockDb.loans[index], ...data };
        return mockDb.loans[index];
      }),
    },
    user: {
      findUnique: jest.fn(async () => ({ id: 'user-1', staff_id: 'STAFF001', email: 'test@example.com', first_name: 'Test' })),
    },
    loanInvoice: {
      create: jest.fn(async ({ data }) => {
        const invoice = { ...data, id: `inv-${Date.now()}` };
        mockDb.invoices.push(invoice);
        return invoice;
      }),
    },
    $transaction: jest.fn((cb) => cb(prisma)),
  },
}));

jest.mock('../../src/shared/utils/email', () => ({
  sendEmail: jest.fn(),
}));

describe('Loan Integration Flow', () => {
  let loanService: LoanService;
  let loanId: string;

  beforeAll(() => {
    loanService = new LoanService();
  });

  it('should complete full loan lifecycle', async () => {
    // 1. Apply
    const loan = await loanService.applyForLoan('user-1', {
      amount: 5000,
      purpose: 'Home Renovation',
      term: 12
    });
    expect(loan.status).toBe('pending');
    loanId = loan.id;

    // 2. Approve (Admin)
    const approved = await loanService.approveLoan(loanId, 'admin-1');
    expect(approved.status).toBe('approved');

    // 3. Activate
    const active = await loanService.activateLoan(loanId);
    expect(active.status).toBe('active');

    // 4. Generate Invoice
    const invoice = await loanService.generatePaymentInvoice('user-1', loanId, 500);
    expect(invoice.amounts.total).toBe(500);
    expect(invoice.qrContent).toContain('UHI-2134');
    
    // Verify Invoice Persistence
    expect(mockDb.invoices.length).toBe(1);
    expect(mockDb.invoices[0].amount).toBe(500);
  });
});
