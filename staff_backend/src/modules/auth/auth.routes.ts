import { Router } from 'express';
import { authController } from './auth.controller';
import { validateBody } from '../../shared/middleware/validation.middleware';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
} from './auth.validation';

const router = Router();

// Public auth routes
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

// Password reset routes (public)
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

// Change password (authenticated)
router.post('/change-password', authMiddleware, validateBody(changePasswordSchema), authController.changePassword);

// 2FA Routes (Authenticated)
router.post('/2fa/setup', authMiddleware, authController.setupTwoFactor);
router.post('/2fa/enable', authMiddleware, authController.enableTwoFactor);
router.post('/2fa/disable', authMiddleware, authController.disableTwoFactor);

export default router;

