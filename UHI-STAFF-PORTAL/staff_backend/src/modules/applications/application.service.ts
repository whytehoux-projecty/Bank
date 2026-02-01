import { prisma } from "../../config/database";
import { AppError } from "../../shared/middleware/errorHandler.middleware";
import { CreateApplicationDTO } from "./application.types";

export class ApplicationService {
  async createApplication(userId: string, data: CreateApplicationDTO) {
    let status: "pending" | "approved" | "rejected" | "cancelled" = "pending";
    let autoApproveReason = "";

    // Workflow Rule: Auto-approve leave requests less than 3 days
    if (data.type === 'leave') {
      const appData = data.data as any;
      if (appData.startDate && appData.endDate) {
        const start = new Date(appData.startDate);
        const end = new Date(appData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive count

        if (diffDays < 3) {
          status = "approved";
          autoApproveReason = "System Auto-Approval: Leave duration is less than 3 days.";
        }
      }
    }

    const app = await prisma.application.create({
      data: {
        user_id: userId,
        type: data.type,
        data: data.data,
        status: status,
      },
    });

    // If auto-approved, create an audit log
    if (status === 'approved' && autoApproveReason) {
      await prisma.applicationAudit.create({
        data: {
          application_id: app.id,
          actor_id: userId, // Attributed to the user as system action context
          action: "system_auto_approve",
          comment: autoApproveReason
        }
      });
    }

    return app;
  }

  async getMyApplications(userId: string) {
    return prisma.application.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }

  async cancelApplication(userId: string, applicationId: string) {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, user_id: userId },
    });

    if (!application) {
      throw new AppError("Application not found", 404);
    }

    if (application.status !== "pending") {
      throw new AppError("Only pending applications can be cancelled", 400);
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: "cancelled" },
    });

    await prisma.applicationAudit.create({
      data: {
        application_id: applicationId,
        actor_id: userId,
        action: "cancelled",
      },
    });

    return updated;
  }

  async getApplicationsForHandler(handlerId: string) {
    // This is a simplification. In real app, we need logic to know who handles what.
    // For now, assuming handler manually assigned or we query by role permissions in separate method.
    return prisma.application.findMany({
      where: { current_handler_id: handlerId },
      include: {
        user: { select: { first_name: true, last_name: true, staff_id: true } },
      },
    });
  }
}

export const applicationService = new ApplicationService();
