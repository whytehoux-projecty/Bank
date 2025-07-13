import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AuditService } from '../services/AuditService';

// Validation schemas
const GetUsersQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  kycStatus: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED']).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const UpdateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  reason: z.string().optional(),
});

const UpdateKYCStatusSchema = z.object({
  kycStatus: z.enum(['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED']),
  reviewNotes: z.string().optional(),
});

const GetTransactionsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('50').transform(Number),
  userId: z.string().optional(),
  accountId: z.string().optional(),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.string().optional().transform(Number),
  maxAmount: z.string().optional().transform(Number),
  sortBy: z.enum(['createdAt', 'amount', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const GetWireTransfersQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('50').transform(Number),
  userId: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  type: z.enum(['DOMESTIC', 'INTERNATIONAL']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.string().optional().transform(Number),
  maxAmount: z.string().optional().transform(Number),
  sortBy: z.enum(['createdAt', 'amount', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const UpdateWireTransferStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED']),
  reviewNotes: z.string().optional(),
});

export class AdminController {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const [
        totalUsers,
        activeUsers,
        pendingKYC,
        totalAccounts,
        totalTransactions,
        totalWireTransfers,
        pendingWireTransfers,
        totalBalance,
        monthlyTransactionVolume,
        monthlyWireTransferVolume,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { kycStatus: 'PENDING' } }),
        prisma.account.count(),
        prisma.transaction.count(),
        prisma.wireTransfer.count(),
        prisma.wireTransfer.count({ where: { complianceStatus: 'PENDING' } }),
        prisma.account.aggregate({
          _sum: { balance: true },
        }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.wireTransfer.aggregate({
          _sum: { fee: true },
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      return reply.send({
        users: {
          total: totalUsers,
          active: activeUsers,
          pendingKYC,
        },
        accounts: {
          total: totalAccounts,
          totalBalance: totalBalance._sum.balance || 0,
        },
        transactions: {
          total: totalTransactions,
          monthlyVolume: monthlyTransactionVolume._sum.amount || 0,
        },
        wireTransfers: {
          total: totalWireTransfers,
          pending: pendingWireTransfers,
          monthlyVolume: monthlyWireTransferVolume._sum.fee || 0,
        },
      });
    } catch (error) {
      request.log.error('Error fetching dashboard stats:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Get users with pagination and filtering
   */
  static async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = GetUsersQuerySchema.parse(request.query);
      const { page, limit, search, status, kycStatus, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      if (status) where.status = status;
      if (kycStatus) where.kycStatus = kycStatus;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            accounts: {
              select: {
                id: true,
                accountNumber: true,
                accountType: true,
                balance: true,
                status: true,
              },
            },
            _count: {
              select: {
                accounts: true,
                kycDocuments: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return reply.send({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      request.log.error('Error fetching users:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Get specific user details
   */
  static async getUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: {
            include: {
              transactions: {
                take: 10,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          kycDocuments: true,
          address: true,
          auditLogs: {
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({ user });
    } catch (error) {
      request.log.error('Error fetching user:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Update user status
   */
  static async updateUserStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };
      const { status, reason } = UpdateUserStatusSchema.parse(request.body);
      const adminUserId = (request as any).user.id;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { 
          status,
          suspensionReason: status === 'SUSPENDED' ? (reason || null) : null,
        },
      });

      // Log the status change
      await AuditService.log({
        adminUserId,
        userId,
        action: 'USER_STATUS_UPDATE',
        entityType: 'USER',
        entityId: userId,
        details: `User status changed to ${status}${reason ? `. Reason: ${reason}` : ''}`,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
        severity: status === 'SUSPENDED' ? 'WARNING' : 'INFO',
        category: 'ADMIN',
      });

      return reply.send({ user });
    } catch (error) {
      request.log.error('Error updating user status:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Update KYC status
   */
  static async updateKYCStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as { userId: string };
      const { kycStatus, reviewNotes } = UpdateKYCStatusSchema.parse(request.body);
      const adminUserId = (request as any).user.id;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { 
          kycStatus,
          kycNotes: reviewNotes || null,
        },
      });

      // Log the KYC status change
      await AuditService.log({
        adminUserId,
        userId,
        action: 'KYC_STATUS_UPDATE',
        entityType: 'USER',
        entityId: userId,
        details: `KYC status changed to ${kycStatus}${reviewNotes ? `. Notes: ${reviewNotes}` : ''}`,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
        severity: 'INFO',
        category: 'KYC',
      });

      return reply.send({ user });
    } catch (error) {
      request.log.error('Error updating KYC status:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Get transactions with filtering
   */
  static async getTransactions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = GetTransactionsQuerySchema.parse(request.query);
      const { page, limit, userId, accountId, type, status, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (userId) where.account = { userId };
      if (accountId) where.accountId = accountId;
      if (type) where.type = type;
      if (status) where.status = status;
      if (minAmount !== undefined && !isNaN(minAmount)) where.amount = { ...where.amount, gte: minAmount };
      if (maxAmount !== undefined && !isNaN(maxAmount)) where.amount = { ...where.amount, lte: maxAmount };
      if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
      if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            account: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        prisma.transaction.count({ where }),
      ]);

      return reply.send({
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      request.log.error('Error fetching transactions:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Get wire transfers with filtering
   */
  static async getWireTransfers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = GetWireTransfersQuerySchema.parse(request.query);
      const { page, limit, userId, status, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (userId) where.senderAccount = { userId };
      if (status) where.complianceStatus = status;
      if (minAmount !== undefined && !isNaN(minAmount)) where.transaction = { amount: { gte: minAmount } };
      if (maxAmount !== undefined && !isNaN(maxAmount)) where.transaction = { amount: { lte: maxAmount } };
      if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
      if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

      const [wireTransfers, total] = await Promise.all([
        prisma.wireTransfer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            transaction: true,
            senderAccount: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        prisma.wireTransfer.count({ where }),
      ]);

      return reply.send({
        wireTransfers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      request.log.error('Error fetching wire transfers:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Update wire transfer status
   */
  static async updateWireTransferStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { transferId } = request.params as { transferId: string };
      const { status, reviewNotes } = UpdateWireTransferStatusSchema.parse(request.body);
      const adminUserId = (request as any).user.id;

      const wireTransfer = await prisma.wireTransfer.update({
        where: { id: transferId },
        data: { 
          complianceStatus: status,
          approvedBy: status === 'APPROVED' ? adminUserId : null,
          approvedAt: status === 'APPROVED' ? new Date() : null,
          rejectionReason: status === 'REJECTED' ? (reviewNotes || null) : null,
        },
        include: {
          transaction: true,
          senderAccount: {
            include: {
              user: true,
            },
          },
        },
      });

      // Log the wire transfer status change
      await AuditService.log({
        adminUserId,
        userId: wireTransfer.senderAccount?.user?.id || null,
        action: 'WIRE_TRANSFER_STATUS_UPDATE',
        entityType: 'WIRE_TRANSFER',
        entityId: transferId,
        details: `Wire transfer status changed to ${status}${reviewNotes ? `. Notes: ${reviewNotes}` : ''}`,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'] || '',
        severity: 'INFO',
        category: 'TRANSACTION',
      });

      return reply.send({ wireTransfer });
    } catch (error) {
      request.log.error('Error updating wire transfer status:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = z.object({
        page: z.string().optional().default('1').transform(Number),
        limit: z.string().optional().default('50').transform(Number),
        userId: z.string().optional(),
        adminUserId: z.string().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        severity: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).optional(),
        category: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).parse(request.query);

      const { page, limit, userId, adminUserId, action, entityType, severity, category, startDate, endDate } = query;
      const skip = (page - 1) * limit;

      const where: any = {};
      
      if (userId) where.userId = userId;
      if (adminUserId) where.adminUserId = adminUserId;
      if (action) where.action = { contains: action, mode: 'insensitive' };
      if (entityType) where.entityType = entityType;
      if (severity) where.severity = severity;
      if (category) where.category = category;
      if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
      if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

      const [auditLogs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            adminUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      return reply.send({
        auditLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      request.log.error('Error fetching audit logs:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}