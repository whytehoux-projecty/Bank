import { DocumentType, FamilyRelationship, Gender } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../shared/middleware/errorHandler.middleware";
import {
  UpdateProfileDTO,
  CreateBankAccountDTO,
  CreateFamilyMemberDTO,
  CreateDocumentDTO,
} from "./staff.types";

export class StaffService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        employment_history: {
          orderBy: { start_date: "desc" },
          take: 1,
          include: { department: true },
        },
        staff_profile: true,
        bank_accounts: { where: { is_primary: true }, take: 1 },
        deployments: { where: { status: "active" }, take: 1 },
        leave_balances: { orderBy: { year: "desc" }, take: 1 },
        family_members: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const currentJob = user.employment_history[0];
    const mainRole = user.roles.length > 0 ? user.roles[0].role.name : "staff";

    return {
      id: user.id,
      staffId: user.staff_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: mainRole,
      status: user.status,
      avatarUrl: user.avatar_url,
      department: currentJob?.department?.name || "Unassigned",
      position: currentJob?.position_title || "N/A",
      joinedAt: user.created_at,
      // UHI Enhanced Fields
      staffProfile: user.staff_profile,
      bankAccount: user.bank_accounts[0] || null,
      deployment: user.deployments[0] || null,
      leaveBalance: user.leave_balances[0] || null,
      familyMembers: user.family_members,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    // Update core user data
    const userUpdate = prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        avatar_url: data.avatarUrl,
      },
    });

    // Update or create StaffProfile extended data
    const profileUpdate = prisma.staffProfile.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        personal_phone: data.personalPhone,
        work_phone: data.workPhone,
        permanent_address: data.permanentAddress,
        current_address: data.currentAddress,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        emergency_contact_relation: data.emergencyContactRelation,
      },
      update: {
        personal_phone: data.personalPhone,
        work_phone: data.workPhone,
        permanent_address: data.permanentAddress,
        current_address: data.currentAddress,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        emergency_contact_relation: data.emergencyContactRelation,
      },
    });

    const [updatedUser, updatedProfile] = await prisma.$transaction([
      userUpdate,
      profileUpdate,
    ]);

    return {
      ...updatedUser,
      staffProfile: updatedProfile,
    };
  }

  async addBankAccount(userId: string, data: CreateBankAccountDTO) {
    // If this is primary, unset other primaries
    if (data.isPrimary) {
      await prisma.bankAccount.updateMany({
        where: { user_id: userId },
        data: { is_primary: false },
      });
    }

    return prisma.bankAccount.create({
      data: {
        user_id: userId,
        bank_name: data.bankName,
        account_holder_name: data.accountHolderName,
        account_number: data.accountNumber,
        swift_code: data.swiftCode,
        iban: data.iban,
        currency: data.currency || "USD",
        is_primary: data.isPrimary || false,
        created_by: userId, // Self-created
      },
    });
  }

  async getBankAccounts(userId: string) {
    return prisma.bankAccount.findMany({
      where: { user_id: userId },
      orderBy: { is_primary: "desc" },
    });
  }

  async addFamilyMember(userId: string, data: CreateFamilyMemberDTO) {
    const relationship = data.relationship as FamilyRelationship;
    const gender = data.gender ? (data.gender as Gender) : undefined;

    return prisma.familyMember.create({
      data: {
        user_id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        relationship: relationship,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender,
        is_dependent: data.isDependent || false,
        is_emergency_contact: data.isEmergencyContact || false,
        created_by: userId,
      },
    });
  }

  async getFamilyMembers(userId: string) {
    return prisma.familyMember.findMany({
      where: { user_id: userId },
    });
  }

  async getEmploymentHistory(userId: string) {
    return prisma.employmentHistory.findMany({
      where: { user_id: userId },
      include: { department: true },
      orderBy: { start_date: "desc" },
    });
  }

  async addDocument(userId: string, data: CreateDocumentDTO) {
    return prisma.staffDocument.create({
      data: {
        user_id: userId,
        document_type: data.documentType as DocumentType,
        document_name: data.documentName,
        document_number: data.documentNumber,
        issuing_authority: data.issuingAuthority,
        issuing_country: data.issuingCountry,
        issue_date: data.issueDate ? new Date(data.issueDate) : null,
        expiry_date: data.expiryDate ? new Date(data.expiryDate) : null,
        file_url: data.fileUrl,
        file_name: data.fileName,
        file_size: data.fileSize,
        file_type: data.fileType,
        notes: data.notes,
        uploaded_by: userId,
      },
    });
  }

  async getDocuments(userId: string) {
    const docs = await prisma.staffDocument.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    return docs.map((doc) => ({
      ...doc,
      file_url:
        doc.file_url && doc.file_url.startsWith("s3:")
          ? `/api/v1/staff/documents/${doc.id}/download`
          : doc.file_url,
    }));
  }

  async getNotifications(userId: string) {
    const [applications, audits, payrollRecords, loans] = await Promise.all([
      prisma.application.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      prisma.applicationAudit.findMany({
        where: { application: { user_id: userId } },
        orderBy: { timestamp: "desc" },
        take: 20,
        include: { application: true },
      }),
      prisma.payrollRecord.findMany({
        where: { user_id: userId },
        orderBy: [{ period_year: "desc" }, { period_month: "desc" }],
        take: 6,
      }),
      prisma.loan.findMany({
        where: { user_id: userId },
        orderBy: { updated_at: "desc" },
        take: 10,
      }),
    ]);

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const notifications = [
      ...applications.map((app) => ({
        id: `application:${app.id}:created`,
        type: "info" as const,
        category: "applications" as const,
        title: `${capitalize(app.type)} Application Submitted`,
        message: "Your application has been submitted for review.",
        createdAt: app.created_at.toISOString(),
        read: false,
      })),
      ...audits.map((audit) => {
        const action = String(audit.action || "").toLowerCase();
        const type =
          action === "approved"
            ? "success"
            : action === "rejected"
              ? "warning"
              : action === "cancelled"
                ? "info"
                : "info";
        const title =
          action === "approved"
            ? "Application Approved"
            : action === "rejected"
              ? "Application Rejected"
              : action === "cancelled"
                ? "Application Cancelled"
                : "Application Update";
        const baseMessage =
          action === "approved"
            ? "Your application has been approved."
            : action === "rejected"
              ? "Your application has been rejected."
              : action === "cancelled"
                ? "Your application has been cancelled."
                : "There is an update on your application.";
        const comment = audit.comment ? ` ${audit.comment}` : "";
        return {
          id: `application_audit:${audit.id}`,
          type: type as "info" | "success" | "warning" | "error",
          category: "applications" as const,
          title,
          message: `${baseMessage}${comment}`.trim(),
          createdAt: audit.timestamp.toISOString(),
          read: false,
        };
      }),
      ...payrollRecords
        .filter((r) => r.status !== "draft")
        .map((record) => {
          const isPaid = record.status === "paid";
          const title = isPaid ? "Salary Credited" : "Payslip Available";
          const message = isPaid
            ? "Your salary has been credited and your payslip is available."
            : "Your payslip is now available for download.";

          const createdAt = record.payment_date
            ? record.payment_date.toISOString()
            : new Date(
              record.period_year,
              record.period_month - 1,
              1,
            ).toISOString();

          return {
            id: `payroll:${record.id}`,
            type: isPaid ? "success" : "info",
            category: "payroll" as const,
            title,
            message,
            createdAt,
            read: false,
          };
        }),
      ...loans.map((loan) => {
        const status = String(loan.status || "").toLowerCase();
        const type =
          status === "approved"
            ? "success"
            : status === "rejected"
              ? "warning"
              : status === "active"
                ? "info"
                : status === "completed"
                  ? "success"
                  : status === "defaulted"
                    ? "error"
                    : "info";
        const title =
          status === "pending"
            ? "Loan Application Submitted"
            : status === "approved"
              ? "Loan Approved"
              : status === "active"
                ? "Loan Active"
                : status === "completed"
                  ? "Loan Completed"
                  : status === "rejected"
                    ? "Loan Rejected"
                    : status === "defaulted"
                      ? "Loan Defaulted"
                      : "Loan Update";
        const message =
          status === "pending"
            ? "Your loan application has been submitted."
            : status === "approved"
              ? "Your loan has been approved."
              : status === "active"
                ? "Your loan is now active."
                : status === "completed"
                  ? "Your loan has been completed."
                  : status === "rejected"
                    ? "Your loan application has been rejected."
                    : status === "defaulted"
                      ? "Your loan is in default."
                      : "There is an update on your loan.";

        return {
          id: `loan:${loan.id}:${loan.updated_at.toISOString()}`,
          type: type as "info" | "success" | "warning" | "error",
          category: "payroll" as const,
          title,
          message,
          createdAt: loan.updated_at.toISOString(),
          read: false,
        };
      }),
    ];

    const byCreatedAtDesc = (
      a: { createdAt: string },
      b: { createdAt: string },
    ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    return notifications.sort(byCreatedAtDesc).slice(0, 30);
  }

  async markNotificationRead(userId: string, notificationId: string) {
    void userId;
    void notificationId;
    return { success: true };
  }

  async markAllNotificationsRead(userId: string) {
    void userId;
    return { success: true };
  }
}

export const staffService = new StaffService();
