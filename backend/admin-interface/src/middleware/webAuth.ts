import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export async function authenticateWeb(request: FastifyRequest, reply: FastifyReply) {
  // TEMPORARY: Authentication disabled for development
  // TODO: Re-enable authentication when ready
  
  // Mock user data for development
  (request as any).user = {
    id: 'dev-admin-001',
    email: 'admin@novabank.dev',
    firstName: 'Admin',
    lastName: 'User',
    role: 'SUPER_ADMIN',
    permissions: ['*'] // All permissions
  };

  // Skip authentication logic for now
  return;

  /* ORIGINAL AUTHENTICATION CODE (COMMENTED OUT FOR DEVELOPMENT)
  try {
    const token = request.cookies['admin_token'];

    if (!token) {
      return reply.redirect('/login');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if session is still active
    const session = await prisma.adminSession.findFirst({
      where: {
        sessionId: token,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        adminUser: true,
      },
    });

    if (!session || session.adminUser.status !== 'ACTIVE') {
      return reply.redirect('/login?error=session_expired');
    }

    // Attach user to request
    (request as any).user = {
      id: session.adminUser.id,
      email: session.adminUser.email,
      firstName: session.adminUser.firstName,
      lastName: session.adminUser.lastName,
      role: session.adminUser.role,
    };

    // Update last activity
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    });

  } catch (error) {
    return reply.redirect('/login?error=invalid_token');
  }
  */
}

export async function redirectIfAuthenticated(request: FastifyRequest, reply: FastifyReply) {
  // TEMPORARY: Authentication disabled for development
  // Always redirect to dashboard since we're bypassing auth
  return reply.redirect('/dashboard');

  /* ORIGINAL CODE (COMMENTED OUT FOR DEVELOPMENT)
  try {
    const token = request.cookies['admin_token'];

    if (token) {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Check if session is still active
      const session = await prisma.adminSession.findFirst({
        where: {
          sessionId: token,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          adminUser: {
            select: {
              status: true,
            },
          },
        },
      });

      if (session && session.adminUser && session.adminUser.status === 'ACTIVE') {
        return reply.redirect('/dashboard');
      }
    }
  } catch (error) {
    // Token is invalid, clear it and continue
    reply.clearCookie('admin_token', { path: '/' });
  }
  */
}