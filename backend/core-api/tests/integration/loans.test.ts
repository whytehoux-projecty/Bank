
import Fastify, { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Define Mock Functions
const mockCreateLoan = jest.fn();
const mockGetLoan = jest.fn();
const mockProcessRepayment = jest.fn();
const mockGenerateHistoryPDF = jest.fn();

// Mock LoanService
jest.mock('../../src/services/loan.service', () => {
    return {
        LoanService: jest.fn().mockImplementation(() => ({
            createLoan: mockCreateLoan,
            getLoan: mockGetLoan,
            processRepayment: mockProcessRepayment,
            generateHistoryPDF: mockGenerateHistoryPDF,
        }))
    };
});

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma: any = {
        loan: { findMany: jest.fn(), findFirst: jest.fn() }
    };
    return {
        PrismaClient: jest.fn(() => mPrisma),
        Prisma: { Decimal: jest.fn(val => val) }
    };
});

import loanRoutes from '../../src/routes/loans';

describe('Loan Integration Tests', () => {
    let app: FastifyInstance;
    const mockPrisma = new PrismaClient() as any;

    beforeAll(async () => {
        app = Fastify();
        app.decorate('authenticate', async (req: any, _reply: any) => {
            req.user = { userId: 'user-123' };
        });
        await app.register(loanRoutes);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET / should return loans', async () => {
        mockPrisma.loan.findMany.mockResolvedValue([{ id: 'l1', amount: 1000 }]);
        const res = await app.inject({ method: 'GET', url: '/' });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body).loans).toHaveLength(1);
    });

    it('POST / should create loan', async () => {
        mockCreateLoan.mockResolvedValue({ id: 'new-loan', amount: 1000 });
        const res = await app.inject({
            method: 'POST',
            url: '/',
            payload: {
                accountId: 'acc-1',
                amount: 1000,
                interestRate: 5,
                termMonths: 12
            }
        });
        expect(res.statusCode).toBe(201);
        expect(mockCreateLoan).toHaveBeenCalledWith(expect.objectContaining({
            amount: 1000,
            termMonths: 12
        }));
    });

    it('GET /:id should return details', async () => {
        mockGetLoan.mockResolvedValue({ id: 'l1', amount: 1000 });
        const res = await app.inject({ method: 'GET', url: '/l1' });
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body).loan.id).toBe('l1');
    });

    it('POST /:id/repayment should process repayment', async () => {
        mockProcessRepayment.mockResolvedValue({ status: 'COMPLETED' });
        const res = await app.inject({
            method: 'POST',
            url: '/l1/repayment',
            payload: { accountId: 'acc-1', amount: 100 }
        });
        expect(res.statusCode).toBe(200);
        expect(mockProcessRepayment).toHaveBeenCalledWith(expect.objectContaining({
            loanId: 'l1',
            amount: 100
        }));
    });

    it('GET /:id/history/pdf should return pdf', async () => {
        mockGenerateHistoryPDF.mockResolvedValue(Buffer.from('PDF_CONTENT'));
        const res = await app.inject({ method: 'GET', url: '/l1/history/pdf' });
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toBe('application/pdf');
    });

    it('GET /:id/history/pdf should return 404 if not found', async () => {
        mockGenerateHistoryPDF.mockRejectedValue(new Error('Loan not found'));
        const res = await app.inject({ method: 'GET', url: '/l1/history/pdf' });
        expect(res.statusCode).toBe(404);
    });
});
