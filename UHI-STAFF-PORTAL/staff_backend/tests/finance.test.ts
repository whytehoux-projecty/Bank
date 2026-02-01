import request from 'supertest';
import express from 'express';
import { financeController } from '../src/modules/finance/finance.controller';
import { financeService } from '../src/modules/finance/finance.service';

// Mock finance service
jest.mock('../src/modules/finance/finance.service');

const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req: any, _res: any, next: any) => {
    req.user = { id: 'test-user-id', staffId: 'STF001', role: 'staff' };
    next();
});

// Setup routes for testing
app.get('/api/v1/finance/payroll', financeController.getPayroll);
app.get('/api/v1/finance/loans', financeController.getLoans);
app.get('/api/v1/finance/payroll/:id/pdf', financeController.downloadPayslip);
app.get('/api/v1/finance/benefits', financeController.getBenefits);

describe('Finance Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/finance/payroll', () => {
        it('should return payroll records for authenticated user', async () => {
            const mockPayroll = [
                {
                    id: '1',
                    period_month: 1,
                    period_year: 2025,
                    basic_salary: '5000.00',
                    allowances: '500.00',
                    deductions: '200.00',
                    net_pay: '5300.00',
                    currency: 'USD',
                },
            ];

            (financeService.getPayrollRecords as jest.Mock).mockResolvedValue(mockPayroll);

            const response = await request(app)
                .get('/api/v1/finance/payroll');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].net_pay).toBe('5300.00');
        });
    });

    describe('GET /api/v1/finance/loans', () => {
        it('should return loans for authenticated user', async () => {
            const mockLoans = [
                {
                    id: '1',
                    amount: '10000.00',
                    balance: '5000.00',
                    status: 'active',
                    purpose: 'Personal',
                },
            ];

            (financeService.getLoans as jest.Mock).mockResolvedValue(mockLoans);

            const response = await request(app)
                .get('/api/v1/finance/loans');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].status).toBe('active');
        });
    });

    describe('GET /api/v1/finance/payroll/:id/pdf', () => {
        it('should return PDF binary for valid payroll record', async () => {
            const mockPdfBuffer = Buffer.from('mock pdf content');
            const mockPayroll = {
                id: '1',
                period_month: 1,
                period_year: 2025,
            };

            (financeService.generatePayslipPDF as jest.Mock).mockResolvedValue(mockPdfBuffer);
            (financeService.getPayrollRecordById as jest.Mock).mockResolvedValue(mockPayroll);

            const response = await request(app)
                .get('/api/v1/finance/payroll/1/pdf');

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/pdf');
            expect(response.headers['content-disposition']).toContain('payslip_jan_2025.pdf');
        });
    });

    describe('GET /api/v1/finance/benefits', () => {
        it('should return benefits summary for authenticated user', async () => {
            const mockBenefits = {
                leaveBalance: { annual: 15, sick: 10 },
                insurance: { type: 'Comprehensive', coverage: 'Family' },
                yearsOfService: 3,
            };

            (financeService.getBenefitsSummary as jest.Mock).mockResolvedValue(mockBenefits);

            const response = await request(app)
                .get('/api/v1/finance/benefits');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.yearsOfService).toBe(3);
        });
    });
});
