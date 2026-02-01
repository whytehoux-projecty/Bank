import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston about our colors
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define format for console output (development)
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
    )
);

// Define which transports the logger must use
const transports = [
    // Console transport for all environments
    new winston.transports.Console({
        format: process.env.NODE_ENV === 'production' ? format : consoleFormat,
    }),

    // File transport for errors
    new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format,
    }),

    // File transport for all logs
    new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        format,
    }),
];

// Create the logger
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    levels,
    format,
    transports,
    exitOnError: false,
});

// Create a stream object for Morgan
export const morganStream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Helper functions for structured logging
export const logRequest = (req: any, userId?: string) => {
    logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId,
        userAgent: req.get('user-agent'),
    });
};

export const logError = (error: Error, context?: Record<string, any>) => {
    logger.error('Error occurred', {
        message: error.message,
        stack: error.stack,
        ...context,
    });
};

export const logDatabaseQuery = (query: string, duration: number) => {
    logger.debug('Database Query', {
        query,
        duration: `${duration}ms`,
    });
};

export const logEmailSent = (to: string, subject: string, success: boolean) => {
    logger.info('Email Sent', {
        to,
        subject,
        success,
    });
};

export const logFileUpload = (filename: string, size: number, userId: string) => {
    logger.info('File Upload', {
        filename,
        size: `${(size / 1024).toFixed(2)} KB`,
        userId,
    });
};

export default logger;
