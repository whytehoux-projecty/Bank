import { Request, Response, NextFunction } from 'express';
import { logger, logRequest } from '../../config/logger';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log the request
    const userId = (req as any).user?.id;
    logRequest(req, userId);

    // Capture the original end function
    const originalEnd = res.end;

    // Override the end function to log response
    res.end = function (chunk?: any, encoding?: any, callback?: any): any {
        const duration = Date.now() - startTime;

        logger.info('HTTP Response', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId,
        });

        // Call the original end function
        return originalEnd.call(this, chunk, encoding, callback);
    };

    next();
};

export const errorLoggingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Request Error', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        userId: (req as any).user?.id,
        ip: req.ip,
    });

    next(err);
};
