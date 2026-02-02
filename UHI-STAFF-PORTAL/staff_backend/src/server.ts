import app from './app';
import dotenv from 'dotenv';
import { prisma } from './config/database';
import http from 'http';
import { logger } from './config/logger';

import { validateEnv } from './config/env.validation';

dotenv.config();
validateEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);

let server: http.Server;

async function startServer() {
    try {
        // Connect to database
        await prisma.$connect();
        logger.info('✅ Connected to database');

        server = app.listen(PORT, '0.0.0.0', () => {
            logger.info(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown(signal: string) {
    logger.info(`\n🛑 Received ${signal}. Shutting down gracefully...`);

    if (server) {
        server.close(() => {
            logger.info('✅ HTTP server closed');
        });
    }

    await prisma.$disconnect();
    logger.info('✅ Database connection closed');

    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
