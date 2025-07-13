import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import crypto from 'crypto';

// Configuration
import config from './config/environment';
import { swaggerConfig, swaggerUiConfig } from './config/swagger';

// Database and services
import db from './lib/database';
import { log } from './lib/logger';
import { ServiceFactory } from './lib/base';

// Middleware
import { securityHeaders, requestLogger, corsConfig, cspHeader } from './middleware/security';
import { authenticateToken } from './middleware/auth';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import accountRoutes from './routes/accounts';
import transactionRoutes from './routes/transactions';
import kycRoutes from './routes/kyc';
import wireTransferRoutes from './routes/wire-transfers';
import systemRoutes from './routes/system';

// Initialize Fastify
const fastify = Fastify({
  logger: false, // We'll use our custom logger
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
  genReqId: () => crypto.randomUUID(),
});

// Global middleware
fastify.addHook('onRequest', securityHeaders);
fastify.addHook('onRequest', requestLogger);
fastify.addHook('onRequest', cspHeader);

// Register plugins
const registerPlugins = async () => {
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // We handle this manually
  });

  await fastify.register(cors, corsConfig);

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded, retry in ${context.ttl} seconds`,
      },
      meta: {
        timestamp: new Date().toISOString(),
        retryAfter: context.ttl,
      },
    }),
  });

  await fastify.register(jwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_EXPIRES_IN,
    },
  });

  await fastify.register(cookie, {
    secret: config.JWT_SECRET,
    parseOptions: {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,
    },
  });

  await fastify.register(swagger, swaggerConfig);
  await fastify.register(swaggerUi, swaggerUiConfig);
};

// Initialize services
const serviceFactory = ServiceFactory.getInstance(db.prisma, db.redis);

// Make services available to routes
fastify.decorate('services', serviceFactory);
fastify.decorate('db', db);

// Add authenticate decorator
fastify.decorate('authenticate', authenticateToken);

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    success: true,
    data: {
      name: 'Aurum Vault Core API',
      version: '1.0.0',
      description: 'Secure banking API for financial services',
      status: 'operational',
      timestamp: new Date().toISOString(),
      endpoints: {
        documentation: '/docs',
        health: '/health',
        api: {
          auth: '/api/auth',
          users: '/api/users',
          accounts: '/api/accounts',
          transactions: '/api/transactions',
          kyc: '/api/kyc',
          wireTransfers: '/api/wire-transfers',
          system: '/api/system',
        },
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: request.id,
    },
  };
});

// Health check endpoints
fastify.get('/health', async (request, reply) => {
  const healthStatus = await db.healthCheck();

  const status =
    healthStatus.database === 'connected' && healthStatus.cache === 'connected'
      ? 'healthy'
      : 'unhealthy';

  const statusCode = status === 'healthy' ? 200 : 503;

  reply.status(statusCode);
  return {
    success: status === 'healthy',
    data: {
      status,
      timestamp: new Date().toISOString(),
      services: healthStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: request.id,
    },
  };
});

fastify.get('/health/database', async (request, reply) => {
  try {
    await db.prisma.$queryRaw`SELECT 1`;
    return {
      success: true,
      data: { status: 'connected', timestamp: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), requestId: request.id },
    };
  } catch (error) {
    reply.status(503);
    return {
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Database connection failed' },
      meta: { timestamp: new Date().toISOString(), requestId: request.id },
    };
  }
});

fastify.get('/health/cache', async (request, reply) => {
  try {
    await db.redis.ping();
    return {
      success: true,
      data: { status: 'connected', timestamp: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), requestId: request.id },
    };
  } catch (error) {
    reply.status(503);
    return {
      success: false,
      error: { code: 'CACHE_ERROR', message: 'Cache connection failed' },
      meta: { timestamp: new Date().toISOString(), requestId: request.id },
    };
  }
});

// Register API routes
const registerRoutes = async () => {
  await fastify.register(systemRoutes, { prefix: '/api/system' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(accountRoutes, { prefix: '/api/accounts' });
  await fastify.register(transactionRoutes, { prefix: '/api/transactions' });
  await fastify.register(kycRoutes, { prefix: '/api/kyc' });
  await fastify.register(wireTransferRoutes, { prefix: '/api/wire-transfers' });
};

// Global error handler
fastify.setErrorHandler(async (error, request, reply) => {
  log.error('Unhandled error', error, {
    url: request.url,
    method: request.method,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    userId: (request as any).user?.userId,
  });

  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';

  reply.status(statusCode);
  return {
    success: false,
    error: {
      code: errorCode,
      message:
        config.NODE_ENV === 'production' ? 'An internal server error occurred' : error.message,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: request.id,
    },
  };
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  log.info(`Received ${signal}, shutting down gracefully`);

  try {
    await fastify.close();
    await db.disconnect();
    log.info('Server shut down successfully');
    process.exit(0);
  } catch (error) {
    log.error('Error during shutdown', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    // Connect to databases
    await db.connect();

    // Register plugins
    await registerPlugins();

    // Register routes
    await registerRoutes();

    // Start server
    await fastify.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });

    log.info(`🚀 Aurum Vault Core API server running on http://0.0.0.0:${config.PORT}`);
    log.info(`📚 API documentation available at http://0.0.0.0:${config.PORT}/docs`);
  } catch (error) {
    log.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
