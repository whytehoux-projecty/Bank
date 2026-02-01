import { Request, Response, NextFunction } from 'express';
import { leaveBalanceService } from './leaveBalance.service';

export class LeaveBalanceController {
    // Get own leave balance
    async getMyLeaveBalance(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;

            const summary = await leaveBalanceService.getLeaveBalanceSummary(userId, year);

            res.json({
                success: true,
                data: summary,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all leave balances (admin)
    async getAllLeaveBalances(req: Request, res: Response, next: NextFunction) {
        try {
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;
            const search = req.query.search as string;
            const department = req.query.department as string;

            const balances = await leaveBalanceService.getAllLeaveBalances(year, {
                search,
                department,
            });

            res.json({
                success: true,
                data: balances,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get specific user's leave balance (admin)
    async getUserLeaveBalance(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const year = req.query.year ? parseInt(req.query.year as string) : undefined;

            const summary = await leaveBalanceService.getLeaveBalanceSummary(userId, year);

            res.json({
                success: true,
                data: summary,
            });
        } catch (error) {
            next(error);
        }
    }

    // Initialize leave balance for user (admin)
    async initializeLeaveBalance(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const { year } = req.body;

            const balance = await leaveBalanceService.initializeLeaveBalance(
                userId,
                year || new Date().getFullYear()
            );

            res.status(201).json({
                success: true,
                message: 'Leave balance initialized successfully',
                data: balance,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update leave balance (admin)
    async updateLeaveBalance(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const { year, ...updateData } = req.body;

            const balance = await leaveBalanceService.updateLeaveBalance(
                userId,
                year || new Date().getFullYear(),
                updateData
            );

            res.json({
                success: true,
                message: 'Leave balance updated successfully',
                data: balance,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const leaveBalanceController = new LeaveBalanceController();
