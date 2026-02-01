import { prisma } from "../../config/database";
import { AppError } from "../../shared/middleware/errorHandler.middleware";
import { CreateDeploymentDTO } from "../staff/staff.types";
import { DeploymentStatus, DeploymentType, HardshipLevel } from "@prisma/client";

export class AdminService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        staff_id: true,
        first_name: true,
        last_name: true,
        email: true,
        status: true,
        created_at: true,
        roles: {
          include: { role: true },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async getSystemStats() {
    const [
      userCount,
      appCount,
      pendingAppCount,
      activeContractsCount,
      activeLoansCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "pending" } }),
      prisma.contract.count({ where: { status: "active" } }),
      prisma.loan.count({ where: { status: "active" } }),
    ]);

    return {
      users: userCount,
      applications: appCount,
      pendingApplications: pendingAppCount,
      activeContracts: activeContractsCount,
      activeLoans: activeLoansCount,
    };
  }

  async getApplications(filter: {
    status?: "pending" | "approved" | "rejected" | "cancelled";
  }) {
    const status = filter.status;
    const where = status ? { status } : undefined;

    return prisma.application.findMany({
      where,
      include: {
        user: { select: { first_name: true, last_name: true, staff_id: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async decideApplication(
    adminId: string,
    applicationId: string,
    decision: "approved" | "rejected",
    comment?: string
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new AppError("Application not found", 404);
    }

    if (application.status !== "pending") {
      throw new AppError("Only pending applications can be decided", 400);
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: decision,
        current_handler_id: adminId,
      },
    });

    await prisma.applicationAudit.create({
      data: {
        application_id: applicationId,
        actor_id: adminId,
        action: decision,
        comment: comment || null,
      },
    });

    return updated;
  }

  async getRecentActivity() {
    return prisma.applicationAudit.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
      include: {
        application: true,
        actor: {
          select: { first_name: true, last_name: true, staff_id: true },
        },
      },
    });
  }

  async getFullUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        staff_profile: true,
        bank_accounts: true,
        family_members: true,
        deployments: { orderBy: { start_date: 'desc' } },
        staff_documents: true,
        employment_history: { orderBy: { start_date: 'desc' } }
      }
    });
  }

  async createDeployment(userId: string, data: CreateDeploymentDTO) {
    return prisma.deployment.create({
      data: {
        user_id: userId,
        mission_name: data.missionName,
        country: data.country,
        start_date: new Date(data.startDate),
        end_date: data.endDate ? new Date(data.endDate) : null,
        deployment_role: data.deploymentRole,
        status: (data.status as DeploymentStatus) || DeploymentStatus.planned,
        deployment_type: (data.deploymentType as DeploymentType) || DeploymentType.standard,
        hardship_level: data.hardshipLevel as HardshipLevel,
        danger_pay_eligible: data.dangerPayEligible || false,
        created_by: '00000000-0000-0000-0000-000000000000' // Placeholder for now, or pass admin ID
      }
    });
  }
}

export const adminService = new AdminService();
