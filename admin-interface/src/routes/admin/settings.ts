import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireAdminRole } from '../../middleware/auth';
import { z } from 'zod';

const updateSettingsSchema = z.object({
    verificationEnabled: z.boolean(),
    globalThreshold: z.number().min(0),
    documentTypes: z.array(z.string()),
    categoryThresholds: z.record(z.string(), z.number().min(0)).optional(),
    notificationEmail: z.string().email().optional().or(z.literal('')),
    notificationSms: z.string().optional()
});

export default async function settingsRoutes(fastify: FastifyInstance) {

    // Get Settings
    fastify.get('/', { preHandler: [authenticateToken, requireAdminRole] }, async (req, reply) => {
        try {
            const configs = await prisma.systemConfig.findMany({
                where: {
                    key: {
                        in: [
                            'payment_verification_enabled',
                            'payment_verification_threshold',
                            'payment_verification_doc_types',
                            'payment_verification_categories',
                            'admin_notification_email',
                            'admin_notification_sms'
                        ]
                    }
                }
            });

            const settings = {
                verificationEnabled: configs.find(c => c.key === 'payment_verification_enabled')?.value === 'true',
                globalThreshold: Number(configs.find(c => c.key === 'payment_verification_threshold')?.value || 10000),
                documentTypes: JSON.parse(configs.find(c => c.key === 'payment_verification_doc_types')?.value || '["PASSPORT","ID_CARD"]'),
                categoryThresholds: JSON.parse(configs.find(c => c.key === 'payment_verification_categories')?.value || '{}'),
                notificationEmail: configs.find(c => c.key === 'admin_notification_email')?.value || '',
                notificationSms: configs.find(c => c.key === 'admin_notification_sms')?.value || ''
            };

            return reply.send({ success: true, data: settings });
        } catch (error) {
            req.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch settings' });
        }
    });

    // Update Settings
    fastify.post('/', { preHandler: [authenticateToken, requireAdminRole] }, async (req, reply) => {
        try {
            const body = updateSettingsSchema.parse(req.body);
            const user = (req as any).user;

            await prisma.$transaction(async (tx) => {
                // Helper to upsert
                const upsertConfig = async (key: string, value: string, desc: string) => {
                    // Check previous value for audit
                    const prev = await tx.systemConfig.findUnique({ where: { key } });

                    if (prev?.value !== value) {
                        await tx.systemConfig.upsert({
                            where: { key },
                            update: { value, updatedBy: user.id },
                            create: { key, value, description: desc, updatedBy: user.id }
                        });

                        await tx.auditLog.create({
                            data: {
                                adminUserId: user.id,
                                action: 'UPDATE_SYSTEM_CONFIG',
                                entityType: 'SYSTEM_CONFIG',
                                entityId: key,
                                details: JSON.stringify({ prev: prev?.value, new: value })
                            }
                        });
                    }
                };

                await upsertConfig('payment_verification_enabled', String(body.verificationEnabled), 'Master switch for payment verification');
                await upsertConfig('payment_verification_threshold', String(body.globalThreshold), 'Global threshold for verification');
                await upsertConfig('payment_verification_doc_types', JSON.stringify(body.documentTypes), 'Accepted document types');
                await upsertConfig('payment_verification_categories', JSON.stringify(body.categoryThresholds || {}), 'Category specific thresholds');
                await upsertConfig('admin_notification_email', body.notificationEmail || '', 'Admin notification email');
                await upsertConfig('admin_notification_sms', body.notificationSms || '', 'Admin notification SMS');
            });

            return reply.send({ success: true, message: 'Settings updated successfully' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ message: 'Validation error', errors: error.errors });
            }
            req.log.error(error);
            return reply.status(500).send({ message: 'Failed to update settings' });
        }
    });

    // Get History
    fastify.get('/history', { preHandler: [authenticateToken, requireAdminRole] }, async (req, reply) => {
        try {
            const logs = await prisma.auditLog.findMany({
                where: {
                    action: 'UPDATE_SYSTEM_CONFIG',
                    entityType: 'SYSTEM_CONFIG'
                },
                include: {
                    adminUser: {
                        select: { firstName: true, lastName: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            });
            return reply.send({ success: true, data: logs });
        } catch (error) {
            req.log.error(error);
            return reply.status(500).send({ message: 'Failed to fetch history' });
        }
    });
}
