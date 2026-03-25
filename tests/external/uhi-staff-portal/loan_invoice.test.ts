
import { LoanService } from '../../../../../../UHI Staff Portal /backend/src/modules/finance/loan.service';
import { prisma } from '../../../../../../UHI Staff Portal /backend/src/config/database';

// Note: You may need to adjust imports when moving this file to the actual project.

// Mock Prisma
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

// Mock Email
jest.mock('../../../../../../UHI Staff Portal /backend/src/shared/utils/email', () => ({
  sendEmail: jest.fn(),
}));

describe('Loan Service - Invoice Generation', () => {
  let loanService: LoanService;
  const mockDate = new Date('2025-01-01T00:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    loanService = new LoanService();
    jest.clearAllMocks();
  });

  it('should calculate invoice totals correctly', async () => {
    const userId = 'user-123';
    const loanId = 'loan-abc';
    const amount = 1000;

    (prisma.loan.findFirst as jest.Mock).mockResolvedValue({
      id: loanId,
      status: 'active',
      balance: 5000,
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      staff_id: 'STAFF001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    });

    (prisma.loanInvoice.create as jest.Mock).mockResolvedValue({});

    const result = await loanService.generatePaymentInvoice(userId, loanId, amount);

    expect(result.amounts.principal).toBe(1000);
    expect(result.amounts.tax).toBe(0); // 0% tax
    expect(result.amounts.fee).toBe(0); // 0 fee
    expect(result.amounts.total).toBe(1000);
    expect(prisma.loanInvoice.create).toHaveBeenCalled();
  });

  it('should format QR code data correctly', async () => {
    const userId = 'user-123';
    const loanId = 'loan-abc-uuid-segment';
    const amount = 500;

    (prisma.loan.findFirst as jest.Mock).mockResolvedValue({
      id: loanId,
      status: 'active',
      balance: 2000,
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      staff_id: 'STAFF001',
    });

    const result = await loanService.generatePaymentInvoice(userId, loanId, amount);
    
    // Format: SERVICE_CODE|STAFF_ID-LOAN_CODE|ACCOUNT_NUMBER
    // Service Code: UHI-2134
    // Account Code: G/L/{YEAR}/{LOAN_CODE}
    const year = new Date().getFullYear();
    const expectedQrStart = `UHI-2134|STAFF001-${loanId}|G/L/${year}/segment`;
    
    expect(result.qrContent).toBe(expectedQrStart);
  });
});
