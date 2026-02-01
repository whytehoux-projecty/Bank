import { Request, Response, NextFunction } from 'express';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e9 + diff[1]) / 1e6;

        // Only set header if headers haven't been sent yet (though 'finish' is usually too late)
        // For accurate header timing, we'd need to hook into writeHead or use 'response-time' package.
        // For now, let's just avoid the crash.
        if (!res.headersSent) {
            res.setHeader('X-Response-Time', `${timeInMs.toFixed(3)}ms`);
        }
    });

    next();
};
