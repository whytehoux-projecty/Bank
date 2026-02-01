import { PayrollStatus, Prisma } from "@prisma/client";
import { prisma } from '../../config/database';
import { AppError } from "../../shared/middleware/errorHandler.middleware";
import { sendEmail } from "../../shared/utils/email";
import { payslipAvailableTemplate } from "../../shared/utils/emailTemplates";

export class PayrollService {
  /**
   * Get all payroll records with optional filtering
   */
  async getPayrollRecords(filters: {
    periodMonth?: number;
    periodYear?: number;
    status?: PayrollStatus;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      periodMonth,
      periodYear,
      status,
      department,
      search,
      page = 1,
      limit = 10,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.PayrollRecordWhereInput = {};

    if (periodMonth) where.period_month = periodMonth;
    if (periodYear) where.period_year = periodYear;
    if (status) where.status = status;

    if (department) {
      where.user = {
        employment_history: {
          some: {
            end_date: null,
            department: {
              name: department,
            },
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { user: { first_name: { contains: search, mode: "insensitive" } } },
        { user: { last_name: { contains: search, mode: "insensitive" } } },
        { user: { staff_id: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.payrollRecord.count({ where }),
      prisma.payrollRecord.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              staff_id: true,
              email: true,
              avatar_url: true,
              employment_history: {
                where: { end_date: null },
                include: { department: true }, // department name needed
                take: 1,
              },
            },
          },
        },
        orderBy: { user: { last_name: "asc" } },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get statistics for a specific period
   */
  async getPayrollStats(month: number, year: number) {
    const records = await prisma.payrollRecord.findMany({
      where: { period_month: month, period_year: year },
    });

    const totalStaff = await prisma.user.count({ where: { status: "active" } });
    const processedCount = records.length;

    const totalPayroll = records.reduce((sum, r) => sum + Number(r.net_pay), 0);
    const pendingPayments = records.filter((r) => r.status !== "paid").length;
    const totalBasic = records.reduce(
      (sum, r) => sum + Number(r.basic_salary),
      0
    );
    const totalAllowances = records.reduce(
      (sum, r) => sum + Number(r.allowances),
      0
    );
    const totalDeductions = records.reduce(
      (sum, r) => sum + Number(r.deductions),
      0
    );

    return {
      totalStaff,
      processedCount,
      totalPayroll,
      pendingPayments,
      breakdown: {
        basic: totalBasic,
        allowances: totalAllowances,
        deductions: totalDeductions,
      },
    };
  }

  /**
   * Get single payroll record
   */
  async getPayrollRecord(id: string) {
    const record = await prisma.payrollRecord.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!record) throw new AppError("Payroll record not found", 404);
    return record;
  }

  /**
   * Update a payroll record
   */
  async updatePayrollRecord(
    id: string,
    data: {
      basic_salary?: number;
      allowances?: number;
      allowance_details?: Prisma.InputJsonValue;
      deductions?: number;
      deduction_details?: Prisma.InputJsonValue;
      status?: PayrollStatus;
    }
  ) {
    // Calculate net pay if financial fields change
    let net_pay: number | undefined;

    if (
      data.basic_salary !== undefined ||
      data.allowances !== undefined ||
      data.deductions !== undefined
    ) {
      const current = await this.getPayrollRecord(id);
      const basic =
        data.basic_salary !== undefined
          ? Number(data.basic_salary)
          : Number(current.basic_salary);
      const allowances =
        data.allowances !== undefined
          ? Number(data.allowances)
          : Number(current.allowances);
      const deductions =
        data.deductions !== undefined
          ? Number(data.deductions)
          : Number(current.deductions);

      net_pay = basic + allowances - deductions;
    }

    const updateData: Prisma.PayrollRecordUpdateInput = { ...data };
    if (net_pay !== undefined) updateData.net_pay = net_pay;

    return prisma.payrollRecord.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Generate payroll for all active users for a period
   */
  async generatePayroll(month: number, year: number) {
    // Check if already exists
    const existingCount = await prisma.payrollRecord.count({
      where: { period_month: month, period_year: year },
    });

    if (existingCount > 0) {
      throw new AppError("Payroll already generated for this period", 400);
    }

    // Get all active users
    const users = await prisma.user.findMany({
      where: { status: "active" },
      include: {
        contracts: {
          where: { status: "active" },
          take: 1,
        },
      },
    });

    const records = [];

    for (const user of users) {
      // Logic to determine salary would ideally come from Contract, but for now we use a default or mocked logic
      // In a real app, Contract model would have 'salary' field.
      // We'll assume a default or fetch if available.
      // Since Contract model in schema doesn't have salary, I will use a placeholder or random for demo,
      // or better, if I can't find it, skip or set 0.

      const basicSalary = 5000; // Default placeholder
      const allowances = 0;
      const deductions = 0;
      const netPay = basicSalary + allowances - deductions;

      records.push({
        user_id: user.id,
        period_month: month,
        period_year: year,
        basic_salary: basicSalary,
        allowances,
        deductions,
        net_pay: netPay,
        currency: "USD",
        status: "draft" as PayrollStatus,
      });
    }

    if (records.length === 0)
      return { count: 0, message: "No active users found" };

    // Bulk create (createMany is supported in recent Prisma versions)
    const result = await prisma.payrollRecord.createMany({
      data: records,
    });

    return { count: result.count, message: "Payroll generated successfully" };
  }

  /**
   * Bulk process/pay payroll
   */
  async bulkStatusUpdate(ids: string[], status: PayrollStatus) {
    const result = await prisma.payrollRecord.updateMany({
      where: { id: { in: ids } },
      data: {
        status,
        payment_date: status === "paid" ? new Date() : undefined,
      },
    });
    return result;
  }

  /**
   * Send payslips via email
   */
  async sendPayslips(ids: string[]) {
    const records = await prisma.payrollRecord.findMany({
      where: { id: { in: ids } },
      include: { user: true },
    });

    let sent = 0;
    const errors: Array<{ id: string; email: string; error: string }> = [];

    for (const record of records) {
      try {
        const monthName = new Date(
          record.period_year,
          record.period_month - 1
        ).toLocaleString("default", { month: "long" });
        const period = `${monthName} ${record.period_year}`;

        await sendEmail({
          to: record.user.email,
          subject: `Payslip Available: ${period}`,
          html: payslipAvailableTemplate({
            staffName: record.user.first_name,
            period,
            netPay: Number(record.net_pay),
            currency: record.currency,
            paymentDate: record.payment_date
              ? record.payment_date.toISOString().split("T")[0]
              : undefined,
            portalUrl: `${process.env.FRONTEND_URL}/payments.html`,
          }),
        });
        sent++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        errors.push({
          id: record.id,
          email: record.user.email,
          error: message,
        });
      }
    }

    return { sent, failed: errors.length, errors };
  }
}
