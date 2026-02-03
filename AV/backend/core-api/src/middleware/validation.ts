import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError, sendError } from '../utils/responses';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      if (schemas.body && request.body) {
        request.body = schemas.body.parse(request.body);
      }

      // Validate query parameters
      if (schemas.query && request.query) {
        request.query = schemas.query.parse(request.query);
      }

      // Validate route parameters
      if (schemas.params && request.params) {
        request.params = schemas.params.parse(request.params);
      }

      // Validate headers
      if (schemas.headers && request.headers) {
        request.headers = schemas.headers.parse(request.headers);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = new ValidationError(
          'Request validation failed',
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }))
        );
        return sendError(reply, validationError, request.id);
      }
      
      return sendError(reply, error as Error, request.id);
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  pagination: {
    page: 'number().int().min(1).default(1)',
    limit: 'number().int().min(1).max(100).default(20)',
  },
  
  id: {
    id: 'string().uuid("Invalid ID format")',
  },
  
  dateRange: {
    startDate: 'string().datetime().optional()',
    endDate: 'string().datetime().optional()',
  },
};

// Rate limiting by user ID
export const rateLimitByUser = (maxRequests: number = 100, windowMs: number = 60000) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user?.userId) {
      return; // Skip rate limiting for unauthenticated requests
    }

    const userId = user.userId;
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return;
    }

    if (userLimit.count >= maxRequests) {
      reply.status(429).send({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
        },
      });
      return;
    }

    userLimit.count++;
  };
};