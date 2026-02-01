/**
 * Loans API Integration Tests
 * 
 * Tests REAL loan operations with:
 * - Real loan calculations
 * - Real interest calculations
 * - Real payment schedules
 * - Real database transactions
 * 
 * NO MOCKING - All tests use actual API and database
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: TEST_CONFIG.database.connectionString,
        },
    },
});

describe('Loans API - Real Integration Tests', () => {
    let authToken: string;
    let csrfToken: string;
    let staffId: string;
    let testLoanId: string;

    beforeAll(async () => {
        await prisma.$connect();

        const csrfResponse = await request(app).get('/api/v1/csrf-token');
        csrfToken = csrfResponse.body.csrfToken;

        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: TEST_CONFIG.auth.testUsers.staff.password,
            });

        authToken = loginResponse.body.token;

        const user = await prisma.user.findUnique({
            where: { email: TEST_CONFIG.auth.testUsers.staff.email },
            include: { staff: true },
        });
        staffId = user?.staff?.id || '';
    });

    afterAll(async () => {
        if (testLoanId) {
            await prisma.loan.delete({ where: { id: testLoanId } }).catch(() => { });
        }
        await prisma.$disconnect();
    });

    describe('POST /api/v1/loans/apply', () => {
        it('should create loan application with real calculations', async () => {
            const loanData = {
                type: 'PERSONAL',
                principal: 5000000, // 5M UGX
                interestRate: 10, // 10%
                termMonths: 12,
                purpose: 'Home renovation',
            };

            const response = await request(app)
                .post('/api/v1/loans/apply')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send(loanData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.loan).toBeDefined();

            const loan = response.body.loan;
            testLoanId = loan.id;

            // Verify calculations
            const expectedTotal = loanData.principal * (1 + loanData.interestRate / 100);
            const expectedMonthly = expectedTotal / loanData.termMonths;

            expect(Math.abs(loan.totalAmount - expectedTotal)).toBeLessThan(100);
            expect(Math.abs(loan.monthlyPayment - expectedMonthly)).toBeLessThan(10);

            // Verify in database
            const dbLoan = await prisma.loan.findUnique({ where: { id: loan.id } });
            expect(dbLoan).not.toBeNull();
            expect(dbLoan?.principal).toBe(loanData.principal);
            expect(dbLoan?.status).toBe('PENDING');
        });

        it('should validate loan amount limits', async () => {
            const response = await request(app)
                .post('/api/v1/loans/apply')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'PERSONAL',
                    principal: 50000000, // 50M - too high
                    interestRate: 10,
                    termMonths: 12,
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('amount');
        });
    });

    describe('GET /api/v1/loans', () => {
        it('should get real loans from database', async () => {
            const response = await request(app)
                .get('/api/v1/loans')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.loans)).toBe(true);

            if (response.body.loans.length > 0) {
                const loan = response.body.loans[0];
                const dbLoan = await prisma.loan.findUnique({ where: { id: loan.id } });
                expect(dbLoan).not.toBeNull();
            }
        });

        it('should filter loans by status', async () => {
            const response = await request(app)
                .get('/api/v1/loans?status=ACTIVE')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            response.body.loans.forEach((loan: any) => {
                expect(loan.status).toBe('ACTIVE');
            });
        });
    });

    describe('GET /api/v1/loans/:id', () => {
        it('should get loan details with repayment schedule', async () => {
            const listResponse = await request(app)
                .get('/api/v1/loans?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            if (listResponse.body.loans.length > 0) {
                const loanId = listResponse.body.loans[0].id;

                const response = await request(app)
                    .get(`/api/v1/loans/${loanId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.loan).toBeDefined();
                expect(response.body.repaymentSchedule).toBeDefined();
                expect(Array.isArray(response.body.repaymentSchedule)).toBe(true);
            }
        });
    });

    describe('PUT /api/v1/loans/:id/approve', () => {
        it('should approve loan and update status in database', async () => {
            // Create a pending loan first
            const createResponse = await request(app)
                .post('/api/v1/loans/apply')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    type: 'EMERGENCY',
                    principal: 1000000,
                    interestRate: 8,
                    termMonths: 6,
                    purpose: 'Medical emergency',
                });

            const loanId = createResponse.body.loan.id;

            // Approve (requires admin/manager role)
            const adminLogin = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: TEST_CONFIG.auth.testUsers.admin.email,
                    password: TEST_CONFIG.auth.testUsers.admin.password,
                });

            const adminToken = adminLogin.body.token;

            const response = await request(app)
                .put(`/api/v1/loans/${loanId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ comments: 'Approved for disbursement' })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify in database
            const dbLoan = await prisma.loan.findUnique({ where: { id: loanId } });
            expect(dbLoan?.status).toBe('APPROVED');
            expect(dbLoan?.approvalDate).not.toBeNull();

            // Cleanup
            await prisma.loan.delete({ where: { id: loanId } });
        });
    });

    describe('POST /api/v1/loans/:id/payment', () => {
        it('should process loan payment and update balance', async () => {
            // Get an active loan
            const listResponse = await request(app)
                .get('/api/v1/loans?status=ACTIVE&limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            if (listResponse.body.loans.length > 0) {
                const loan = listResponse.body.loans[0];
                const paymentAmount = loan.monthlyPayment;

                const response = await request(app)
                    .post(`/api/v1/loans/${loan.id}/payment`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .set('X-CSRF-Token', csrfToken)
                    .send({
                        amount: paymentAmount,
                        paymentMethod: 'BANK_TRANSFER',
                    })
                    .expect(200);

                expect(response.body.success).toBe(true);

                // Verify payment recorded in database
                const dbLoan = await prisma.loan.findUnique({ where: { id: loan.id } });
                expect(dbLoan?.amountPaid).toBeGreaterThan(loan.amountPaid);
            }
        });
    });

    describe('GET /api/v1/loans/:id/statement', () => {
        it('should generate loan statement PDF', async () => {
            const listResponse = await request(app)
                .get('/api/v1/loans?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            if (listResponse.body.loans.length > 0) {
                const loanId = listResponse.body.loans[0].id;

                const response = await request(app)
                    .get(`/api/v1/loans/${loanId}/statement`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);

                expect(response.headers['content-type']).toContain('application/pdf');
                expect(response.body.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Data Integrity', () => {
        it('should maintain referential integrity on loan updates', async () => {
            const listResponse = await request(app)
                .get('/api/v1/loans?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            if (listResponse.body.loans.length > 0) {
                const loanId = listResponse.body.loans[0].id;

                // Verify staff relationship
                const dbLoan = await prisma.loan.findUnique({
                    where: { id: loanId },
                    include: { staff: true },
                });

                expect(dbLoan?.staff).not.toBeNull();
            }
        });
    });
});
