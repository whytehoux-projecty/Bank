import { GrantStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler.middleware';
import { sendEmail } from '../../shared/utils/email';
import { grantApplicationTemplate, grantApprovalTemplate, grantRejectionTemplate } from '../../shared/utils/emailTemplates';

interface CreateGrantInput {
    amount: number;
    reason: string;
    category: string;
}

export class GrantService {
    // Get all grants for a user
    async getUserGrants(userId: string) {
        const grants = await prisma.grant.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });

        return grants;
    }

    // Get grant by ID for a user
    async getGrantById(userId: string, grantId: string) {
        const grant = await prisma.grant.findFirst({
            where: {
                id: grantId,
                user_id: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        staff_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
        });

        if (!grant) {
            throw new AppError('Grant not found', 404);
        }

        return grant;
    }

    // Apply for a new grant
    async applyForGrant(userId: string, data: CreateGrantInput) {
        // Validate amount
        if (data.amount <= 0) {
            throw new AppError('Grant amount must be greater than 0', 400);
        }

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                staff_id: true,
                first_name: true,
                last_name: true,
                email: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Create grant application
        const grant = await prisma.grant.create({
            data: {
                user_id: userId,
                amount: data.amount,
                reason: data.reason,
                category: data.category,
                status: 'pending',
            },
        });

        // Send email notification
        await this.sendGrantApplicationEmail(user.email, user.first_name, grant);

        return grant;
    }

    // Cancel a pending grant application
    async cancelGrantApplication(userId: string, grantId: string) {
        const grant = await this.getGrantById(userId, grantId);

        if (grant.status !== 'pending') {
            throw new AppError('Only pending grants can be cancelled', 400);
        }

        const cancelled = await prisma.grant.delete({
            where: { id: grantId },
        });

        return cancelled;
    }

    // ============ ADMIN METHODS ============

    // Get all grants (admin)
    async getAllGrants(filters?: { status?: GrantStatus; search?: string; category?: string }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.search) {
            where.user = {
                OR: [
                    { first_name: { contains: filters.search, mode: 'insensitive' } },
                    { last_name: { contains: filters.search, mode: 'insensitive' } },
                    { staff_id: { contains: filters.search, mode: 'insensitive' } },
                ],
            };
        }

        const grants = await prisma.grant.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        staff_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        return grants;
    }

    // Get grant details (admin)
    async getGrantDetails(grantId: string) {
        const grant = await prisma.grant.findUnique({
            where: { id: grantId },
            include: {
                user: {
                    select: {
                        id: true,
                        staff_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        staff_profile: true,
                    },
                },
            },
        });

        if (!grant) {
            throw new AppError('Grant not found', 404);
        }

        return grant;
    }

    // Approve a grant (admin)
    async approveGrant(grantId: string, adminId: string) {
        const grant = await this.getGrantDetails(grantId);

        if (grant.status !== 'pending') {
            throw new AppError('Only pending grants can be approved', 400);
        }

        const approved = await prisma.grant.update({
            where: { id: grantId },
            data: {
                status: 'approved',
                approved_by: adminId,
                approved_at: new Date(),
            },
            include: {
                user: true,
            },
        });

        // Send email notification
        await this.sendGrantApprovalEmail(
            approved.user.email,
            approved.user.first_name,
            approved
        );

        return approved;
    }

    // Reject a grant (admin)
    async rejectGrant(grantId: string, adminId: string, reason?: string) {
        const grant = await this.getGrantDetails(grantId);

        if (grant.status !== 'pending') {
            throw new AppError('Only pending grants can be rejected', 400);
        }

        const rejected = await prisma.grant.update({
            where: { id: grantId },
            data: {
                status: 'rejected',
                rejected_by: adminId,
                rejection_reason: reason,
            },
            include: {
                user: true,
            },
        });

        // Send email notification
        await this.sendGrantRejectionEmail(
            rejected.user.email,
            rejected.user.first_name,
            reason
        );

        return rejected;
    }

    // Mark grant as disbursed (admin)
    async disburseGrant(grantId: string) {
        const grant = await this.getGrantDetails(grantId);

        if (grant.status !== 'approved') {
            throw new AppError('Only approved grants can be disbursed', 400);
        }

        const disbursed = await prisma.grant.update({
            where: { id: grantId },
            data: {
                status: 'disbursed',
            },
        });

        return disbursed;
    }

    // Get grant statistics (admin)
    async getGrantStats() {
        const [
            totalGrants,
            pendingGrants,
            approvedGrants,
            rejectedGrants,
            disbursedGrants,
            totalAmount,
            totalDisbursed,
        ] = await Promise.all([
            prisma.grant.count(),
            prisma.grant.count({ where: { status: 'pending' } }),
            prisma.grant.count({ where: { status: 'approved' } }),
            prisma.grant.count({ where: { status: 'rejected' } }),
            prisma.grant.count({ where: { status: 'disbursed' } }),
            prisma.grant.aggregate({
                _sum: { amount: true },
            }),
            prisma.grant.aggregate({
                where: { status: 'disbursed' },
                _sum: { amount: true },
            }),
        ]);

        return {
            total: totalGrants,
            pending: pendingGrants,
            approved: approvedGrants,
            rejected: rejectedGrants,
            disbursed: disbursedGrants,
            totalAmount: totalAmount._sum.amount || 0,
            totalDisbursed: totalDisbursed._sum.amount || 0,
        };
    }

    // Bulk approve grants (admin)
    async bulkApproveGrants(grantIds: string[], adminId: string) {
        const results = await Promise.allSettled(
            grantIds.map((id) => this.approveGrant(id, adminId))
        );

        return results;
    }

    // ============ EMAIL METHODS ============

    private async sendGrantApplicationEmail(email: string, firstName: string, grant: any) {
        try {
            await sendEmail({
                to: email,
                subject: 'Grant Application Received',
                html: grantApplicationTemplate(firstName, grant),
            });
        } catch (error) {
            console.error('Failed to send grant application email:', error);
        }
    }

    private async sendGrantApprovalEmail(email: string, firstName: string, grant: any) {
        try {
            await sendEmail({
                to: email,
                subject: 'Grant Application Approved',
                html: grantApprovalTemplate(firstName, grant),
            });
        } catch (error) {
            console.error('Failed to send grant approval email:', error);
        }
    }

    private async sendGrantRejectionEmail(email: string, firstName: string, reason?: string) {
        try {
            await sendEmail({
                to: email,
                subject: 'Grant Application Update',
                html: grantRejectionTemplate(firstName, reason),
            });
        } catch (error) {
            console.error('Failed to send grant rejection email:', error);
        }
    }
}

export const grantService = new GrantService();
