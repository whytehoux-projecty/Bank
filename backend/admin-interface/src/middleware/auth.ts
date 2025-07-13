import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { JWT_SECRET } from '../config/constants';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      permissions: string[];
    };
  }
}

export async function authenticateToken(request: any, reply: any) {
  // TEMPORARY: Authentication disabled for development
  // TODO: Re-enable authentication when ready
  
  // Mock user data for development
  request.user = {
    id: 'dev-admin-001',
    email: 'admin@novabank.dev',
    firstName: 'Admin',
    lastName: 'User',
    role: 'SUPER_ADMIN',
    permissions: ['*'], // All permissions
  };

  // Skip authentication logic for now
  return;

  /* ORIGINAL AUTHENTICATION CODE (COMMENTED OUT FOR DEVELOPMENT)
  try {
    const token = request.cookies['admin_token'] || request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({ error: 'Access token required' });
    }

    // Verify JWT
    jwt.verify(token, JWT_SECRET) as any;

    // Check if session is still active
    const session = await prisma.adminSession.findFirst({
      where: {
        sessionId: token,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        adminUser: true,
      },
    });

    if (!session || session.adminUser.status !== 'ACTIVE') {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    // Attach user to request
    request.user = {
      id: session.adminUser.id,
      email: session.adminUser.email,
      role: session.adminUser.role,
      permissions: session.adminUser.permissions,
    };

    // Update last activity
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
  */
}

export function requireAdminRole(request: any, reply: any, done: any) {
  // TEMPORARY: Authentication disabled for development
  // Mock user is already set as SUPER_ADMIN, so always allow access
  done();

  /* ORIGINAL CODE (COMMENTED OUT FOR DEVELOPMENT)
  if (!request.user) {
    return reply.status(401).send({ error: 'Authentication required' });
  }

  const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
  if (!adminRoles.includes(request.user.role)) {
    return reply.status(403).send({ error: 'Admin access required' });
  }

  done();
  */
}

export function requireSuperAdminRole(request: any, reply: any, done: any) {
  // TEMPORARY: Authentication disabled for development
  // Mock user is already set as SUPER_ADMIN, so always allow access
  done();

  /* ORIGINAL CODE (COMMENTED OUT FOR DEVELOPMENT)
  if (!request.user) {
    return reply.status(401).send({ error: 'Authentication required' });
  }

  if (request.user.role !== 'SUPER_ADMIN') {
    return reply.status(403).send({ error: 'Super admin access required' });
  }

  done();
  */
}

export function requirePermission(permission: string) {
  return (request: any, reply: any, done: any) => {
    // TEMPORARY: Authentication disabled for development
    // Mock user has all permissions (*), so always allow access
    done();

    /* ORIGINAL CODE (COMMENTED OUT FOR DEVELOPMENT)
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    const hasPermission = request.user.permissions.includes('*') || 
                         request.user.permissions.includes(permission);

    if (!hasPermission) {
      return reply.status(403).send({ error: `Permission '${permission}' required` });
    }

    done();
    */
  };
}

export async function rateLimitByIP(_request: any, _reply: any) {
  // This would typically use Redis for rate limiting
  // For now, we'll implement a simple in-memory rate limiter
  // In production, use Redis with sliding window or token bucket algorithm
  
  // Allow 100 requests per hour per IP
  // const limit = 100;
  // const window = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // This is a simplified implementation
  // In production, use proper rate limiting with Redis
  
  // Placeholder implementation - no action needed for now
  return;
}