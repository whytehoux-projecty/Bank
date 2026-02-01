import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { generateTokens } from '../../src/shared/utils/jwt';

describe('Performance: Invoice Generation', () => {
  let authToken: string;
  let userId: string;
  let loanId: string;

  beforeAll(async () => {
    const user = {
      id: `user-perf-${Date.now()}`,
      email: `perf-invoice-${Date.now()}@test.com`,
      first_name: 'Perf',
      last_name: 'User',
      staff_id: `STF-${Date.now()}`,
      role: 'staff',
    };

    userId = user.id;
    loanId = `loan-perf-${Date.now()}`;

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (prisma.loan.findFirst as jest.Mock).mockResolvedValue({
      id: loanId,
      user_id: userId,
      amount: 5000,
      balance: 5000,
      currency: 'USD',
      status: 'active',
      reason: null,
      payments: [],
      invoices: [],
    });
    (prisma.loanInvoice.create as jest.Mock).mockImplementation(async ({ data }: any) => ({
      id: `inv-${Date.now()}`,
      ...data,
    }));

    const { accessToken } = generateTokens({ userId: user.id, role: user.role, staffId: user.staff_id });
    authToken = accessToken;
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should generate 20 invoices under acceptable time (simulating concurrent load)', async () => {
    const iterations = 20;
    const start = performance.now();
    const promises = [];

    for (let i = 0; i < iterations; i++) {
      promises.push(
        request(app)
          .post(`/api/v1/finance/loans/${loanId}/invoice`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ amount: 100 })
      );
    }

    const responses = await Promise.all(promises);
    const end = performance.now();
    const duration = end - start;

    console.log(`Generated ${iterations} invoices in ${duration.toFixed(2)}ms`);
    console.log(`Average: ${(duration / iterations).toFixed(2)}ms per invoice`);

    // Validation
    responses.forEach(res => {
      if (res.status !== 201 && res.status !== 200) {
        console.error('Failed request:', res.body);
      }
      expect([200, 201]).toContain(res.status);
    });

    expect(duration / iterations).toBeLessThan(500); // Expect < 500ms per invoice
  }, 30000);
});
