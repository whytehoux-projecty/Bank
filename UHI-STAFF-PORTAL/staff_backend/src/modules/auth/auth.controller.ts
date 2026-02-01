import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

import { AppError } from '../../shared/middleware/errorHandler.middleware';

export class AuthController {

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        // Phase 1: Self-registration is disabled. Admin creates accounts.
        return next(new AppError('Self-registration is disabled. Please contact your administrator to create an account.', 403));
    }

    async logout(_req: Request, res: Response) {
        // Client-side token removal mostly, but we could blacklist tokens here if we used Redis
        res.json({ success: true, message: 'Logged out successfully' });
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Refresh token is required' }
                });
            }
            const tokens = await authService.refreshToken(refreshToken);
            res.json({ success: true, data: tokens });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { currentPassword, newPassword } = req.body;
            const result = await authService.changePassword(userId, currentPassword, newPassword);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async setupTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await authService.setupTwoFactor(userId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async enableTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { token } = req.body;
            const result = await authService.enableTwoFactor(userId, token);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    async disableTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await authService.disableTwoFactor(userId);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();

