import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory for validating request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                const details = error.errors.map((e: { path: (string | number)[]; message: string }) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));

                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request body',
                        details,
                    },
                });
            }
            next(error);
        }
    };
};

/**
 * Middleware factory for validating request params against a Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.params = schema.parse(req.params) as typeof req.params;
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                const details = error.errors.map((e: { path: (string | number)[]; message: string }) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));

                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request parameters',
                        details,
                    },
                });
            }
            next(error);
        }
    };
};
