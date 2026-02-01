import { Request, Response, NextFunction } from 'express';
import { financeService } from './finance.service';

export class FinanceController {
    async getPayroll(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const records = await financeService.getPayrollRecords(userId);
            res.json({ success: true, data: records });
        } catch (error) {
            next(error);
        }
    }

    async getLoans(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const loans = await financeService.getLoans(userId);
            res.json({ success: true, data: loans });
        } catch (error) {
            next(error);
        }
    }

    async getGrants(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const grants = await financeService.getGrants(userId);
            res.json({ success: true, data: grants });
        } catch (error) {
            next(error);
        }
    }

    async downloadPayslip(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const pdfBuffer = await financeService.generatePayslipPDF(userId, id);

            // Get payroll record for filename
            const payroll = await financeService.getPayrollRecordById(userId, id);

            const monthNames = [
                'jan', 'feb', 'mar', 'apr', 'may', 'jun',
                'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
            ];
            const filename = `payslip_${monthNames[payroll.period_month - 1]}_${payroll.period_year}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    }

    async getBenefits(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const benefits = await financeService.getBenefitsSummary(userId);
            res.json({ success: true, data: benefits });
        } catch (error) {
            next(error);
        }
    }
}

export const financeController = new FinanceController();

