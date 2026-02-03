import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { Prisma } from '@prisma/client';
import { NotificationService } from '../services/NotificationService';

export default async function verificationApiRoutes(fastify: FastifyInstance) {

    // List Verifications
    fastify.get('/verifications', { preHandler: authenticateToken }, async (_req, reply) => {
        try {
            const verifications = await prisma.paymentVerification.findMany({
                where: { status: 'PENDING' },
                include: {
                    transaction: {
                        include: {
                            account: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return reply.send({ success: true, data: verifications });
        } catch (error) {
            console.error('Fetch verifications error:', error);
            return reply.status(500).send({ message: 'Failed to fetch verifications' });
        }
    });

    // Approve
    fastify.post<{ Params: { id: string }, Body: { notes?: string } }>('/verifications/:id/approve', { preHandler: authenticateToken }, async (req, reply) => {
        try {
            const { id } = req.params;
            const { notes } = req.body || {};
            const admin = req.user!;

            const verification = await prisma.paymentVerification.findUnique({
                where: { id },
                include: {
                    transaction: {
                        include: {
                            account: {
                                include: { user: true }
                            }
                        }
                    }
                }
            });

            if (!verification || verification.status !== 'PENDING') {
                return reply.status(404).send({ message: 'Verification not found or not pending' });
            }

            await prisma.$transaction(async (tx: any) => {
                await tx.paymentVerification.update({
                    where: { id },
                    data: {
                        status: 'APPROVED',
                        adminNotes: notes,
                        reviewedBy: admin.id,
                        reviewedAt: new Date()
                    }
                });

                await tx.transaction.update({
                    where: { id: verification.transactionId },
                    data: { status: 'COMPLETED', processedAt: new Date() }
                });

                await tx.auditLog.create({
                    data: {
                        adminUserId: admin.id,
                        action: 'APPROVE_PAYMENT',
                        entityType: 'TRANSACTION',
                        entityId: verification.transactionId,
                        details: JSON.stringify({ verificationId: id, notes })
                    }
                });
            });

            const userEmail = verification.transaction.account.user.email;
            await NotificationService.notifyCustomer(userEmail, 'APPROVED', { reference: verification.transaction.reference });

            // Extract invoice number from metadata
            const meta = verification.transaction.metadata ? JSON.parse(verification.transaction.metadata) : {};
            const invoiceNumber = meta.invoiceNumber || meta.invoice_number || null;

            await NotificationService.notifyStaffPortal(
                verification.transactionId,
                'COMPLETED',
                verification.transaction.reference,
                Math.abs(Number(verification.transaction.amount)),
                invoiceNumber
            );

            return reply.send({ success: true, message: 'Approved' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Error approving' });
        }
    });

    // Reject
    fastify.post<{ Params: { id: string }, Body: { notes?: string } }>('/verifications/:id/reject', { preHandler: authenticateToken }, async (req, reply) => {
        try {
            const { id } = req.params;
            const { notes } = req.body || {};
            const admin = req.user!;

            const verification = await prisma.paymentVerification.findUnique({
                where: { id },
                include: {
                    transaction: {
                        include: {
                            account: {
                                include: { user: true }
                            }
                        }
                    }
                }
            });

            if (!verification || verification.status !== 'PENDING') {
                return reply.status(404).send({ message: 'Verification not found or not pending' });
            }

            await prisma.$transaction(async (tx: any) => {
                await tx.paymentVerification.update({
                    where: { id },
                    data: {
                        status: 'REJECTED',
                        adminNotes: notes,
                        reviewedBy: admin.id,
                        reviewedAt: new Date()
                    }
                });

                const transaction = await tx.transaction.update({
                    where: { id: verification.transactionId },
                    data: { status: 'FAILED', processedAt: new Date() }
                });

                // Refund logic
                const refundAmount = Number(transaction.amount) < 0 ? Math.abs(Number(transaction.amount)) : Number(transaction.amount);
                await tx.account.update({
                    where: { id: transaction.accountId },
                    data: { balance: { increment: refundAmount } }
                });

                await tx.transaction.create({
                    data: {
                        reference: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        accountId: transaction.accountId,
                        type: 'REFUND',
                        amount: new Prisma.Decimal(refundAmount),
                        currency: transaction.currency,
                        status: 'COMPLETED',
                        description: `Refund for rejected verification ${verification.id}`,
                        category: 'REFUND',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });

                await tx.auditLog.create({
                    data: {
                        adminUserId: admin.id,
                        action: 'REJECT_PAYMENT',
                        entityType: 'TRANSACTION',
                        entityId: verification.transactionId,
                        details: JSON.stringify({ verificationId: id, notes })
                    }
                });
            });

            const userEmail = verification.transaction.account.user.email;
            await NotificationService.notifyCustomer(userEmail, 'REJECTED', { reference: verification.transaction.reference, reason: notes });
            // For now, passing 0 amount and null invoice since we rely on it ignoring non-COMPLETED status
            await NotificationService.notifyStaffPortal(verification.transactionId, 'REJECTED', verification.transaction.reference, 0, null);

            return reply.send({ success: true, message: 'Rejected' });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: 'Error rejecting' });
        }
    });
}
