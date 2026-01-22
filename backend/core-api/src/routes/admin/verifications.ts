import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAdminRole } from '../../middleware/auth';

const prisma = new PrismaClient();

const reviewSchema = z.object({
    notes: z.string().optional(),
});

export default async function verificationRoutes(fastify: FastifyInstance) {

    // Get Pending Verifications
    fastify.get('/', {
        preHandler: [fastify.authenticate, requireAdminRole]
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const verifications = await prisma.paymentVerification.findMany({
                where: { status: 'PENDING' },
                include: {
                    transaction: {
                        include: {
                            account: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            firstName: true,
                                            lastName: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return reply.send({ success: true, data: verifications });
        } catch (error) {
            request.log.error('Fetch verifications error:', error);
            return reply.status(500).send({ message: 'Failed to fetch verifications' });
        }
    });

    // Get Single Verification
    fastify.get('/:id', {
        preHandler: [fastify.authenticate, requireAdminRole]
    }, async (request, reply) => {
        try {
            const { id } = (request.params as { id: string });
            const verification = await prisma.paymentVerification.findUnique({
                where: { id },
                include: {
                    transaction: {
                        include: {
                            account: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            firstName: true,
                                            lastName: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    adminUser: true
                }
            });

            if (!verification) {
                return reply.status(404).send({ message: 'Verification not found' });
            }

            return reply.send({ success: true, data: verification });
        } catch (error) {
            return reply.status(500).send({ message: 'Error fetching verification' });
        }
    });

    // Approve Verification
    fastify.post('/:id/approve', {
        preHandler: [fastify.authenticate, requireAdminRole]
    }, async (request, reply) => {
        try {
            const { id } = (request.params as { id: string });
            const body = reviewSchema.parse(request.body || {});
            const notes = body.notes;
            const admin = (request as any).admin;

            const verification = await prisma.paymentVerification.findUnique({
                where: { id },
                include: { transaction: true }
            });

            if (!verification) {
                return reply.status(404).send({ message: 'Verification not found' });
            }

            if (verification.status !== 'PENDING') {
                return reply.status(400).send({ message: 'Verification is not pending' });
            }

            await prisma.$transaction(async (tx) => {
                // Update Verification
                await tx.paymentVerification.update({
                    where: { id },
                    data: {
                        status: 'APPROVED',
                        adminNotes: notes || null,
                        reviewedBy: String(admin.id),
                        reviewedAt: new Date()
                    }
                });

                // Update Transaction
                await tx.transaction.update({
                    where: { id: verification.transactionId },
                    data: {
                        status: 'COMPLETED',
                        processedAt: new Date()
                    }
                });

                // Log Audit
                await tx.auditLog.create({
                    data: {
                        adminUserId: String(admin.id),
                        action: 'APPROVE_PAYMENT',
                        entityType: 'TRANSACTION',
                        entityId: verification.transactionId,
                        details: JSON.stringify({ verificationId: id, notes })
                    }
                });
            });

            return reply.send({ success: true, message: 'Payment Approved and Processed' });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ message: 'Validation Error', errors: error.errors });
            }
            request.log.error('Approve verification error:', error);
            return reply.status(500).send({ message: 'Failed to approve verification' });
        }
    });

    // Reject Verification
    fastify.post('/:id/reject', {
        preHandler: [fastify.authenticate, requireAdminRole]
    }, async (request, reply) => {
        try {
            const { id } = (request.params as { id: string });
            const body = reviewSchema.parse(request.body || {});
            const notes = body.notes;
            const admin = (request as any).admin;

            const verification = await prisma.paymentVerification.findUnique({
                where: { id },
                include: { transaction: true }
            });

            if (!verification) {
                return reply.status(404).send({ message: 'Verification not found' });
            }

            if (verification.status !== 'PENDING') {
                return reply.status(400).send({ message: 'Verification is not pending' });
            }

            await prisma.$transaction(async (tx) => {
                // Update Verification
                await tx.paymentVerification.update({
                    where: { id },
                    data: {
                        status: 'REJECTED',
                        adminNotes: notes || null,
                        reviewedBy: String(admin.id),
                        reviewedAt: new Date()
                    }
                });

                // Update Transaction and REFUND
                const transaction = await tx.transaction.update({
                    where: { id: verification.transactionId },
                    data: {
                        status: 'FAILED',
                        processedAt: new Date()
                    }
                });

                // Refund the account
                const refundAmount = Math.abs(Number(transaction.amount));

                await tx.account.update({
                    where: { id: transaction.accountId },
                    data: {
                        balance: { increment: refundAmount }
                    }
                });

                // Create Refund Transaction Record
                await tx.transaction.create({
                    data: {
                        accountId: transaction.accountId,
                        type: 'REFUND',
                        amount: refundAmount,
                        currency: transaction.currency,
                        status: 'COMPLETED',
                        description: `Refund for rejected payment ${transaction.reference}`,
                        reference: `REF-${Date.now()}`,
                        processedAt: new Date(),
                        category: 'REFUND'
                    }
                });

                // Log Audit
                await tx.auditLog.create({
                    data: {
                        adminUserId: String(admin.id),
                        action: 'REJECT_PAYMENT',
                        entityType: 'TRANSACTION',
                        entityId: verification.transactionId,
                        details: JSON.stringify({ verificationId: id, notes })
                    }
                });
            });

            return reply.send({ success: true, message: 'Payment Rejected and Refunded' });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ message: 'Validation Error', errors: error.errors });
            }
            request.log.error('Reject verification error:', error);
            return reply.status(500).send({ message: 'Failed to reject verification' });
        }
    });

}
