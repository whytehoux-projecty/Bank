import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/errorHandler.middleware';

interface UpdateLeaveBalanceInput {
    annual_used?: number;
    sick_used?: number;
    maternity_used?: number;
    paternity_used?: number;
    compassionate_used?: number;
    study_used?: number;
    rr_used?: number;
    unpaid_days_taken?: number;
}

export class LeaveBalanceService {
    // Get leave balance for a user
    async getUserLeaveBalance(userId: string, year?: number) {
        const currentYear = year || new Date().getFullYear();

        let leaveBalance = await prisma.leaveBalance.findUnique({
            where: {
                user_id_year: {
                    user_id: userId,
                    year: currentYear,
                },
            },
        });

        // If no balance exists for this year, create one with defaults
        if (!leaveBalance) {
            leaveBalance = await this.initializeLeaveBalance(userId, currentYear);
        }

        return leaveBalance;
    }

    // Initialize leave balance for a user
    async initializeLeaveBalance(userId: string, year: number) {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { staff_profile: true },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Check if balance already exists
        const existing = await prisma.leaveBalance.findUnique({
            where: {
                user_id_year: {
                    user_id: userId,
                    year,
                },
            },
        });

        if (existing) {
            return existing;
        }

        // Get previous year's balance for carryover
        const previousYear = year - 1;
        const previousBalance = await prisma.leaveBalance.findUnique({
            where: {
                user_id_year: {
                    user_id: userId,
                    year: previousYear,
                },
            },
        });

        // Calculate carryover (max 5 days)
        const carryover = previousBalance
            ? Math.min(
                previousBalance.annual_total - previousBalance.annual_used - previousBalance.annual_pending,
                5
            )
            : 0;

        // Determine R&R eligibility based on staff type
        const isFieldStaff = user.staff_profile?.staff_type === 'field';
        const rrTotal = isFieldStaff ? 10 : 0;

        // Create new leave balance
        const leaveBalance = await prisma.leaveBalance.create({
            data: {
                user_id: userId,
                year,
                annual_carried_over: carryover,
                rr_total: rrTotal,
            },
        });

        return leaveBalance;
    }

    // Update leave balance
    async updateLeaveBalance(userId: string, year: number, data: UpdateLeaveBalanceInput) {
        const leaveBalance = await this.getUserLeaveBalance(userId, year);

        const updated = await prisma.leaveBalance.update({
            where: { id: leaveBalance.id },
            data,
        });

        return updated;
    }

    // Deduct leave days (when leave is approved)
    async deductLeave(userId: string, leaveType: string, days: number, year?: number) {
        const currentYear = year || new Date().getFullYear();
        const leaveBalance = await this.getUserLeaveBalance(userId, currentYear);

        const updateData: any = {};

        switch (leaveType.toLowerCase()) {
            case 'annual':
                const availableAnnual =
                    leaveBalance.annual_total +
                    leaveBalance.annual_carried_over -
                    leaveBalance.annual_used -
                    leaveBalance.annual_pending;
                if (days > availableAnnual) {
                    throw new AppError('Insufficient annual leave balance', 400);
                }
                updateData.annual_used = leaveBalance.annual_used + days;
                updateData.annual_pending = Math.max(0, leaveBalance.annual_pending - days);
                break;

            case 'sick':
                const availableSick = leaveBalance.sick_total - leaveBalance.sick_used;
                if (days > availableSick) {
                    throw new AppError('Insufficient sick leave balance', 400);
                }
                updateData.sick_used = leaveBalance.sick_used + days;
                break;

            case 'maternity':
                const availableMaternity = leaveBalance.maternity_total - leaveBalance.maternity_used;
                if (days > availableMaternity) {
                    throw new AppError('Insufficient maternity leave balance', 400);
                }
                updateData.maternity_used = leaveBalance.maternity_used + days;
                break;

            case 'paternity':
                const availablePaternity = leaveBalance.paternity_total - leaveBalance.paternity_used;
                if (days > availablePaternity) {
                    throw new AppError('Insufficient paternity leave balance', 400);
                }
                updateData.paternity_used = leaveBalance.paternity_used + days;
                break;

            case 'compassionate':
                const availableCompassionate = leaveBalance.compassionate_total - leaveBalance.compassionate_used;
                if (days > availableCompassionate) {
                    throw new AppError('Insufficient compassionate leave balance', 400);
                }
                updateData.compassionate_used = leaveBalance.compassionate_used + days;
                break;

            case 'study':
                const availableStudy = leaveBalance.study_total - leaveBalance.study_used;
                if (days > availableStudy) {
                    throw new AppError('Insufficient study leave balance', 400);
                }
                updateData.study_used = leaveBalance.study_used + days;
                break;

            case 'rr':
            case 'r&r':
                const availableRR = leaveBalance.rr_total - leaveBalance.rr_used;
                if (days > availableRR) {
                    throw new AppError('Insufficient R&R leave balance', 400);
                }
                updateData.rr_used = leaveBalance.rr_used + days;
                break;

            case 'unpaid':
                updateData.unpaid_days_taken = leaveBalance.unpaid_days_taken + days;
                break;

            default:
                throw new AppError('Invalid leave type', 400);
        }

        const updated = await prisma.leaveBalance.update({
            where: { id: leaveBalance.id },
            data: updateData,
        });

        return updated;
    }

    // Mark leave as pending (when application is submitted)
    async markLeavePending(userId: string, days: number, year?: number) {
        const currentYear = year || new Date().getFullYear();
        const leaveBalance = await this.getUserLeaveBalance(userId, currentYear);

        const updated = await prisma.leaveBalance.update({
            where: { id: leaveBalance.id },
            data: {
                annual_pending: leaveBalance.annual_pending + days,
            },
        });

        return updated;
    }

    // Cancel pending leave (when application is rejected/cancelled)
    async cancelPendingLeave(userId: string, days: number, year?: number) {
        const currentYear = year || new Date().getFullYear();
        const leaveBalance = await this.getUserLeaveBalance(userId, currentYear);

        const updated = await prisma.leaveBalance.update({
            where: { id: leaveBalance.id },
            data: {
                annual_pending: Math.max(0, leaveBalance.annual_pending - days),
            },
        });

        return updated;
    }

    // Get leave balance summary
    async getLeaveBalanceSummary(userId: string, year?: number) {
        const currentYear = year || new Date().getFullYear();
        const leaveBalance = await this.getUserLeaveBalance(userId, currentYear);

        return {
            year: currentYear,
            annual: {
                total: leaveBalance.annual_total + leaveBalance.annual_carried_over,
                used: leaveBalance.annual_used,
                pending: leaveBalance.annual_pending,
                available:
                    leaveBalance.annual_total +
                    leaveBalance.annual_carried_over -
                    leaveBalance.annual_used -
                    leaveBalance.annual_pending,
                carriedOver: leaveBalance.annual_carried_over,
            },
            sick: {
                total: leaveBalance.sick_total,
                used: leaveBalance.sick_used,
                available: leaveBalance.sick_total - leaveBalance.sick_used,
            },
            maternity: {
                total: leaveBalance.maternity_total,
                used: leaveBalance.maternity_used,
                available: leaveBalance.maternity_total - leaveBalance.maternity_used,
            },
            paternity: {
                total: leaveBalance.paternity_total,
                used: leaveBalance.paternity_used,
                available: leaveBalance.paternity_total - leaveBalance.paternity_used,
            },
            compassionate: {
                total: leaveBalance.compassionate_total,
                used: leaveBalance.compassionate_used,
                available: leaveBalance.compassionate_total - leaveBalance.compassionate_used,
            },
            study: {
                total: leaveBalance.study_total,
                used: leaveBalance.study_used,
                available: leaveBalance.study_total - leaveBalance.study_used,
            },
            rr: {
                total: leaveBalance.rr_total,
                used: leaveBalance.rr_used,
                available: leaveBalance.rr_total - leaveBalance.rr_used,
            },
            unpaid: {
                daysTaken: leaveBalance.unpaid_days_taken,
            },
        };
    }

    // Get all leave balances (admin)
    async getAllLeaveBalances(year?: number, filters?: { search?: string; department?: string }) {
        const currentYear = year || new Date().getFullYear();

        const where: any = {
            year: currentYear,
        };

        if (filters?.search || filters?.department) {
            where.user = {};

            if (filters.search) {
                where.user.OR = [
                    { first_name: { contains: filters.search, mode: 'insensitive' } },
                    { last_name: { contains: filters.search, mode: 'insensitive' } },
                    { staff_id: { contains: filters.search, mode: 'insensitive' } },
                ];
            }

            if (filters.department) {
                where.user.employment_history = {
                    some: {
                        end_date: null,
                        department: {
                            name: filters.department,
                        },
                    },
                };
            }
        }

        const balances = await prisma.leaveBalance.findMany({
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
            orderBy: {
                user: {
                    staff_id: 'asc',
                },
            },
        });

        return balances;
    }
}

export const leaveBalanceService = new LeaveBalanceService();
