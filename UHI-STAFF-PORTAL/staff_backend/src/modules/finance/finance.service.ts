import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler.middleware';
import { generatePayslipPDF } from '../../shared/utils/pdfGenerator';

export class FinanceService {
    async getPayrollRecords(userId: string) {
        return prisma.payrollRecord.findMany({
            where: { user_id: userId },
            orderBy: [{ period_year: 'desc' }, { period_month: 'desc' }]
        });
    }

    async getLoans(userId: string) {
        return prisma.loan.findMany({
            where: { user_id: userId },
            orderBy: { status: 'asc' } // Pending first
        });
    }

    async getGrants(userId: string) {
        return prisma.grant.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
    }

    async getPayrollRecordById(userId: string, payrollId: string) {
        const record = await prisma.payrollRecord.findFirst({
            where: { id: payrollId, user_id: userId }
        });

        if (!record) {
            throw new AppError('Payroll record not found', 404);
        }

        return record;
    }

    async generatePayslipPDF(userId: string, payrollId: string): Promise<Buffer> {
        // Get payroll record
        const payroll = await prisma.payrollRecord.findFirst({
            where: { id: payrollId, user_id: userId },
            include: { user: true }
        });

        if (!payroll) {
            throw new AppError('Payroll record not found', 404);
        }

        // Generate PDF
        const pdfBuffer = await generatePayslipPDF({
            user: {
                first_name: payroll.user.first_name,
                last_name: payroll.user.last_name,
                staff_id: payroll.user.staff_id,
                email: payroll.user.email,
            },
            payroll: {
                period_month: payroll.period_month,
                period_year: payroll.period_year,
                basic_salary: payroll.basic_salary.toString(),
                allowances: payroll.allowances.toString(),
                deductions: payroll.deductions.toString(),
                net_pay: payroll.net_pay.toString(),
                currency: payroll.currency,
                payment_date: payroll.payment_date,
            },
            organization: {
                name: 'Global Organization',
                address: '123 Main Street, City, Country',
            },
        });

        return pdfBuffer;
    }

    async getBenefitsSummary(userId: string) {
        // Get user's current employment for benefits calculation
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                contracts: {
                    where: { status: 'active' },
                    take: 1,
                },
                employment_history: {
                    orderBy: { start_date: 'desc' },
                    take: 1,
                },
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Calculate years of service
        const joinDate = user.created_at;
        const yearsOfService = Math.floor(
            (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        );

        // Mock benefits data (in a real app, this would come from a benefits table)
        return {
            leaveBalance: {
                annual: 21 - Math.floor(Math.random() * 10), // Mock: random days used
                sick: 15 - Math.floor(Math.random() * 5),
                maternity: 90,
                paternity: 14,
            },
            insurance: {
                type: 'Comprehensive Health & Life',
                coverage: 'Family',
                provider: 'Global Health Insurance Co.',
            },
            retirement: {
                plan: '401(k) Equivalent',
                employeeContribution: '5%',
                employerMatch: '100% up to 5%',
            },
            yearsOfService,
            contractType: user.contracts[0]?.type || 'N/A',
        };
    }
}

export const financeService = new FinanceService();

