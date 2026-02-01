import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.middleware';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Unauthorized: Token missing', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyToken(token);
        req.user = {
            id: payload.userId,
            role: payload.role // In payload we might store single role or handle it differently
        };
        next();
    } catch (error) {
        return next(new AppError('Unauthorized: Invalid token', 401));
    }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Forbidden: Admin access required', 403));
    }
    next();
};
