import { Request, Response, NextFunction } from 'express';
import { grantService } from './grant.service';

export class GrantController {
    // Get user's grants
    async getUserGrants(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const grants = await grantService.getUserGrants(userId);

            res.json({
                success: true,
                data: grants,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get grant details
    async getGrantById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            const grant = await grantService.getGrantById(userId, id);

            res.json({
                success: true,
                data: grant,
            });
        } catch (error) {
            next(error);
        }
    }

    // Apply for grant
    async applyForGrant(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { amount, reason, category } = req.body;

            const grant = await grantService.applyForGrant(userId, {
                amount,
                reason,
                category,
            });

            res.status(201).json({
                success: true,
                message: 'Grant application submitted successfully',
                data: grant,
            });
        } catch (error) {
            next(error);
        }
    }

    // Cancel grant application
    async cancelGrant(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            await grantService.cancelGrantApplication(userId, id);

            res.json({
                success: true,
                message: 'Grant application cancelled successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    // ============ ADMIN METHODS ============

    // Get all grants (admin)
    async getAllGrants(req: Request, res: Response, next: NextFunction) {
        try {
            const status = req.query.status as any;
            const search = req.query.search as string;
            const category = req.query.category as string;

            const grants = await grantService.getAllGrants({
                status,
                search,
                category,
            });

            res.json({
                success: true,
                data: grants,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get grant details (admin)
    async getGrantDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const grant = await grantService.getGrantDetails(id);

            res.json({
                success: true,
                data: grant,
            });
        } catch (error) {
            next(error);
        }
    }

    // Approve grant (admin)
    async approveGrant(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const adminId = (req as any).user.id;

            const grant = await grantService.approveGrant(id, adminId);

            res.json({
                success: true,
                message: 'Grant approved successfully',
                data: grant,
            });
        } catch (error) {
            next(error);
        }
    }

    // Reject grant (admin)
    async rejectGrant(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const adminId = (req as any).user.id;
            const { reason } = req.body;

            const grant = await grantService.rejectGrant(id, adminId, reason);

            res.json({
                success: true,
                message: 'Grant rejected',
                data: grant,
            });
        } catch (error) {
            next(error);
        }
    }

    // Disburse grant (admin)
    async disburseGrant(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const grant = await grantService.disburseGrant(id);

            res.json({
                success: true,
                message: 'Grant marked as disbursed',
                data: grant,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get grant statistics (admin)
    async getGrantStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await grantService.getGrantStats();

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    // Bulk approve grants (admin)
    async bulkApprove(req: Request, res: Response, next: NextFunction) {
        try {
            const { grantIds } = req.body;
            const adminId = (req as any).user.id;

            const results = await grantService.bulkApproveGrants(grantIds, adminId);

            res.json({
                success: true,
                message: 'Bulk approval completed',
                data: results,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const grantController = new GrantController();
