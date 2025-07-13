import { FastifyRequest, FastifyReply } from 'fastify';
import { log } from '../lib/logger';
import { AuthenticationError, ForbiddenError, sendError } from '../utils/responses';

// Security headers middleware
export const securityHeaders = async (request: FastifyRequest, reply: FastifyReply) => {
  reply.headers({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  });
};

// Request logging middleware
export const requestLogger = async (request: FastifyRequest, reply: FastifyReply) => {
  const start = Date.now();
  
  reply.addHook('onSend', async () => {
    const responseTime = Date.now() - start;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const ip = request.ip;
    
    log.request(
      request.method,
      request.url,
      reply.statusCode,
      responseTime,
      {
        ip,
        userAgent,
        userId: (request as any).user?.userId,
      }
    );
  });
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const clientIP = request.ip;
    
    if (!allowedIPs.includes(clientIP)) {
      log.security('IP_ACCESS_DENIED', { ip: clientIP, url: request.url });
      return sendError(reply, new ForbiddenError('Access denied from this IP address'), request.id);
    }
  };
};

// Suspicious activity detection
export const suspiciousActivityDetector = () => {
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i, // SQL injection
    /<script|javascript:|on\w+=/i, // XSS attempts
    /\.\./g, // Path traversal
    /\b(admin|root|administrator)\b/i, // Admin enumeration
  ];

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const requestData = JSON.stringify({
      url: request.url,
      query: request.query,
      body: request.body,
      headers: request.headers,
    });

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestData)) {
        log.security('SUSPICIOUS_ACTIVITY_DETECTED', {
          ip: request.ip,
          url: request.url,
          pattern: pattern.source,
          userAgent: request.headers['user-agent'],
          userId: (request as any).user?.userId,
        });
        
        // Don't block immediately, just log for analysis
        break;
      }
    }
  };
};

// CORS configuration
export const corsConfig = {
  origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      log.security('CORS_VIOLATION', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Content Security Policy
export const cspHeader = (request: FastifyRequest, reply: FastifyReply) => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  reply.header('Content-Security-Policy', csp);
};