import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AdminController } from '../controllers/AdminController';
import { authenticateWeb, redirectIfAuthenticated } from '../middleware/webAuth';

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
  };
}

export default async function webRoutes(fastify: FastifyInstance) {
  // Root route - redirect to dashboard (auth disabled for development)
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    // TEMPORARY: Authentication disabled for development
    // Always redirect to dashboard
    return reply.redirect('/dashboard');

    /* ORIGINAL CODE (COMMENTED OUT FOR DEVELOPMENT)
    try {
      // Check if user has a valid session
      const token = request.cookies.admin_token;
      if (token) {
        // Verify token and redirect to dashboard
        return reply.redirect('/dashboard');
      }
      // No token, show login page
      return reply.redirect('/login');
    } catch (error) {
      return reply.redirect('/login');
    }
    */
  });

  // Login page
  fastify.get('/login', { preHandler: redirectIfAuthenticated }, async (request: FastifyRequest, reply: FastifyReply) => {
    const error = request.query && typeof request.query === 'object' && 'error' in request.query 
      ? request.query.error as string 
      : null;
    
    return reply.view('login', {
      title: 'Admin Login',
      error: error
    });
  });

  // Dashboard page (protected)
  fastify.get('/dashboard', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Get dashboard stats
      const statsRequest = {
        ...request,
        query: {}
      } as any; // Use any to avoid type conflicts with mock data
      
      // Create a mock reply object to capture the stats data
      let statsData: any = null;
      const mockReply = {
        send: (data: any) => {
          statsData = data;
          return mockReply;
        },
        status: () => mockReply,
        code: () => mockReply
      } as any;

      await AdminController.getDashboardStats(statsRequest, mockReply);

      return reply.view('dashboard', {
        title: 'Dashboard',
        user: request.user,
        stats: statsData || {
          totalUsers: 0,
          activeUsers: 0,
          pendingKYC: 0,
          totalAccounts: 0,
          totalTransactions: 0,
          totalWireTransfers: 0,
          pendingWireTransfers: 0,
          totalBalance: 0
        }
      });
    } catch (error) {
      fastify.log.error('Dashboard error:', error);
      return reply.view('dashboard', {
        title: 'Dashboard',
        user: request.user,
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          pendingKYC: 0,
          totalAccounts: 0,
          totalTransactions: 0,
          totalWireTransfers: 0,
          pendingWireTransfers: 0,
          totalBalance: 0
        }
      });
    }
  });

  // Users management page (protected)
  fastify.get('/users', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return reply.view('users', {
      title: 'User Management',
      user: request.user
    });
  });

  // Accounts management page (protected)
  fastify.get('/accounts', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return reply.view('accounts', {
      title: 'Account Management',
      user: request.user
    });
  });

  // Transactions page (protected)
  fastify.get('/transactions', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return reply.view('transactions', {
      title: 'Transaction Monitoring',
      user: request.user
    });
  });

  // KYC management page (protected)
  fastify.get('/kyc', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return reply.view('kyc', {
      title: 'KYC Document Management',
      user: request.user
    });
  });

  // Wire transfers page (protected)
  fastify.get('/wire-transfers', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return reply.view('wire-transfers', {
      title: 'Wire Transfer Management',
      user: request.user
    });
  });

  // Audit logs page (protected)
  fastify.get('/audit-logs', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return reply.view('audit-logs', {
      title: 'Audit Logs',
      user: request.user
    });
  });

  // Settings page (protected)
  fastify.get('/settings', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return reply.view('settings', {
      title: 'Settings',
      user: request.user
    });
  });

  // Profile page (protected)
  fastify.get('/profile', { preHandler: authenticateWeb }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return reply.view('profile', {
      title: 'Profile',
      user: request.user
    });
  });
}