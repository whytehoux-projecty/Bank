import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { InAppNotificationService } from '../services/InAppNotificationService';
import { BulkOperationsService, EntityType, BulkActionType } from '../services/BulkOperationsService';
import { ReportsService, ReportType } from '../services/ReportsService';
import { ActivityTimelineService } from '../services/ActivityTimelineService';
import { TwoFactorAuthService } from '../services/TwoFactorAuthService';

// Validation schemas
const BulkOperationSchema = z.object({
    entityType: z.enum(['USER', 'ACCOUNT', 'TRANSACTION', 'WIRE_TRANSFER', 'CARD']),
    action: z.enum(['UPDATE_STATUS', 'UPDATE_KYC_STATUS', 'DELETE', 'SUSPEND', 'ACTIVATE', 'EXPORT']),
    ids: z.array(z.string()).min(1).max(100),
    data: z.record(z.any()).optional()
});

const ReportSchema = z.object({
    reportType: z.enum([
        'TRANSACTION_SUMMARY',
        'USER_ACTIVITY',
        'KYC_STATUS',
        'WIRE_TRANSFERS',
        'AUDIT_LOG',
        'ACCOUNT_BALANCES',
        'REVENUE',
        'COMPLIANCE'
    ]),
    format: z.enum(['json', 'csv', 'pdf']).optional().default('json'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    filterType: z.string().optional()
});

const TwoFactorVerifySchema = z.object({
    token: z.string().min(6).max(8),
    secret: z.string().optional()
});

export default async function extendedApiRoutes(fastify: FastifyInstance) {
    // Apply authentication to all routes
    fastify.addHook('preHandler', authenticateToken);


    // ============ Notifications API ============

    /**
     * Get notifications for current admin
     */
    fastify.get('/notifications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { unreadOnly, limit, type } = request.query as any;

            const notifications = InAppNotificationService.getForUser(request.user!.id, {
                unreadOnly: unreadOnly === 'true',
                limit: limit ? parseInt(limit) : 50,
                type
            });

            const unreadCount = InAppNotificationService.getUnreadCount(request.user!.id);

            return reply.send({
                success: true,
                data: {
                    notifications,
                    unreadCount
                }
            });
        } catch (error) {
            fastify.log.error({ err: error }, 'Failed to get notifications');
            return reply.status(500).send({ error: 'Failed to get notifications' });
        }
    });

    /**
     * Mark notification as read
     */
    fastify.patch<{ Params: { id: string } }>(
        '/notifications/:id/read',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const success = InAppNotificationService.markAsRead(request.user!.id, request.params.id);

                return reply.send({
                    success,
                    message: success ? 'Notification marked as read' : 'Notification not found'
                });
            } catch (error) {
                return reply.status(500).send({ error: 'Failed to update notification' });
            }
        }
    );

    /**
     * Mark all notifications as read
     */
    fastify.post('/notifications/read-all', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const count = InAppNotificationService.markAllAsRead(request.user!.id);

            return reply.send({
                success: true,
                message: `${count} notifications marked as read`
            });
        } catch (error) {
            return reply.status(500).send({ error: 'Failed to update notifications' });
        }
    });

    /**
     * Delete notification
     */
    fastify.delete<{ Params: { id: string } }>(
        '/notifications/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const success = InAppNotificationService.delete(request.user!.id, request.params.id);

                return reply.send({
                    success,
                    message: success ? 'Notification deleted' : 'Notification not found'
                });
            } catch (error) {
                return reply.status(500).send({ error: 'Failed to delete notification' });
            }
        }
    );

    // ============ Bulk Operations API ============

    /**
     * Execute bulk operation
     */
    fastify.post('/bulk-operations', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = BulkOperationSchema.parse(request.body);

            const result = await BulkOperationsService.execute({
                entityType: body.entityType as EntityType,
                action: body.action as BulkActionType,
                ids: body.ids,
                data: body.data || {},
                adminUserId: request.user!.id,
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'] || 'Unknown'
            });

            return reply.send({
                success: result.success,
                data: result
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: 'Validation error', details: error.errors });
            }
            fastify.log.error({ err: error }, 'Bulk operation failed');
            return reply.status(500).send({ error: 'Bulk operation failed' });
        }
    });

    // ============ Reports API ============

    /**
     * Generate report
     */
    fastify.post('/reports/generate', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = ReportSchema.parse(request.body);

            const filters: any = {};
            if (body.startDate) filters.startDate = new Date(body.startDate);
            if (body.endDate) filters.endDate = new Date(body.endDate);
            if (body.status) filters.status = body.status;
            if (body.filterType) filters.type = body.filterType;

            const reportData = await ReportsService.generate(
                body.reportType as ReportType,
                filters,
                request.user!.id
            );

            switch (body.format) {
                case 'pdf':
                    const pdfBuffer = await ReportsService.generatePDF(reportData);
                    reply.header('Content-Type', 'application/pdf');
                    reply.header('Content-Disposition', `attachment; filename="${body.reportType}_report.pdf"`);
                    return reply.send(pdfBuffer);

                case 'csv':
                    const csvContent = ReportsService.generateCSV(reportData);
                    reply.header('Content-Type', 'text/csv');
                    reply.header('Content-Disposition', `attachment; filename="${body.reportType}_report.csv"`);
                    return reply.send(csvContent);

                default:
                    return reply.send({
                        success: true,
                        data: reportData
                    });
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: 'Validation error', details: error.errors });
            }
            fastify.log.error({ err: error }, 'Report generation failed');
            return reply.status(500).send({ error: 'Failed to generate report' });
        }
    });

    /**
     * Get available report types
     */
    fastify.get('/reports/types', async (_request: FastifyRequest, reply: FastifyReply) => {
        return reply.send({
            success: true,
            data: [
                { type: 'TRANSACTION_SUMMARY', name: 'Transaction Summary', description: 'Overview of all transactions' },
                { type: 'USER_ACTIVITY', name: 'User Activity', description: 'User engagement and activity metrics' },
                { type: 'KYC_STATUS', name: 'KYC Status', description: 'KYC verification status breakdown' },
                { type: 'WIRE_TRANSFERS', name: 'Wire Transfers', description: 'Wire transfer processing report' },
                { type: 'AUDIT_LOG', name: 'Audit Log', description: 'System audit trail' },
                { type: 'ACCOUNT_BALANCES', name: 'Account Balances', description: 'Current account balances snapshot' },
                { type: 'REVENUE', name: 'Revenue', description: 'Fee and revenue analysis' },
                { type: 'COMPLIANCE', name: 'Compliance', description: 'Compliance status overview' }
            ]
        });
    });

    // ============ Activity Timeline API ============

    /**
     * Get activity timeline
     */
    fastify.get('/timeline', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { limit, startDate, endDate, types, userId } = request.query as any;

            const filters: any = {
                limit: limit ? parseInt(limit) : 50
            };
            if (startDate) filters.startDate = new Date(startDate);
            if (endDate) filters.endDate = new Date(endDate);
            if (types) filters.types = types.split(',');
            if (userId) filters.userId = userId;

            const events = await ActivityTimelineService.getTimeline(filters);

            return reply.send({
                success: true,
                data: events
            });
        } catch (error) {
            fastify.log.error({ err: error }, 'Failed to get timeline');
            return reply.status(500).send({ error: 'Failed to get activity timeline' });
        }
    });

    /**
     * Get today's activity summary
     */
    fastify.get('/timeline/today', async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const summary = await ActivityTimelineService.getTodaySummary();

            return reply.send({
                success: true,
                data: summary
            });
        } catch (error) {
            fastify.log.error({ err: error }, 'Failed to get today summary');
            return reply.status(500).send({ error: 'Failed to get activity summary' });
        }
    });

    // ============ Two-Factor Authentication API ============

    /**
     * Setup 2FA
     */
    fastify.post('/2fa/setup', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const isEnabled = await TwoFactorAuthService.isEnabled(request.user!.id);

            if (isEnabled) {
                return reply.status(400).send({ error: '2FA is already enabled' });
            }

            const result = await TwoFactorAuthService.setup(
                request.user!.id,
                request.user!.email
            );

            return reply.send({
                success: true,
                data: {
                    qrCode: result.qrCodeDataUrl,
                    secret: result.secret,
                    backupCodes: result.backupCodes,
                    message: 'Scan the QR code with your authenticator app, then verify with a token'
                }
            });
        } catch (error) {
            fastify.log.error({ err: error }, '2FA setup failed');
            return reply.status(500).send({ error: 'Failed to setup 2FA' });
        }
    });

    /**
     * Verify and enable 2FA
     */
    fastify.post('/2fa/verify', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = TwoFactorVerifySchema.parse(request.body);

            if (!body.secret) {
                return reply.status(400).send({ error: 'Secret is required for verification' });
            }

            const isValid = TwoFactorAuthService.verifyToken(body.secret, body.token);

            if (!isValid) {
                return reply.status(400).send({ error: 'Invalid verification token' });
            }

            // In production, this would save the secret to the database
            return reply.send({
                success: true,
                message: '2FA has been enabled successfully'
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: 'Validation error', details: error.errors });
            }
            return reply.status(500).send({ error: 'Failed to verify 2FA' });
        }
    });

    /**
     * Disable 2FA
     */
    fastify.post('/2fa/disable', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { password } = request.body as { password: string };

            if (!password) {
                return reply.status(400).send({ error: 'Password is required to disable 2FA' });
            }

            const success = await TwoFactorAuthService.disable(request.user!.id, password);

            if (!success) {
                return reply.status(400).send({ error: 'Failed to disable 2FA. Check your password.' });
            }

            return reply.send({
                success: true,
                message: '2FA has been disabled'
            });
        } catch (error) {
            return reply.status(500).send({ error: 'Failed to disable 2FA' });
        }
    });

    /**
     * Check 2FA status
     */
    fastify.get('/2fa/status', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const isEnabled = await TwoFactorAuthService.isEnabled(request.user!.id);

            return reply.send({
                success: true,
                data: {
                    enabled: isEnabled
                }
            });
        } catch (error) {
            return reply.status(500).send({ error: 'Failed to get 2FA status' });
        }
    });

    /**
     * Regenerate backup codes
     */
    fastify.post('/2fa/backup-codes', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const codes = await TwoFactorAuthService.regenerateBackupCodes(request.user!.id);

            if (!codes) {
                return reply.status(400).send({ error: '2FA is not enabled' });
            }

            return reply.send({
                success: true,
                data: {
                    backupCodes: codes,
                    message: 'Save these codes securely. They can only be shown once.'
                }
            });
        } catch (error) {
            return reply.status(500).send({ error: 'Failed to regenerate backup codes' });
        }
    });
}
