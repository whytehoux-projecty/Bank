import { Request, Response, NextFunction } from "express";
import { PayrollService } from "./payroll.service";
import { z } from "zod";
import { PayrollStatus } from "@prisma/client";

const payrollService = new PayrollService();

// Validation Schemas
const generatePayrollSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

const updatePayrollSchema = z.object({
  basic_salary: z.number().optional(),
  allowances: z.number().optional(),
  allowance_details: z.any().optional(),
  deductions: z.number().optional(),
  deduction_details: z.any().optional(),
  status: z.enum(["draft", "processed", "paid"]).optional(),
});

const bulkActionSchema = z.object({
  ids: z.array(z.string().uuid()),
  action: z.enum(["approve", "pay", "email"]),
});

export class PayrollController {
  // Get all records with filters
  async getRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const maybeStatus =
        typeof req.query.status === "string" ? req.query.status : undefined;
      const status =
        maybeStatus &&
        (Object.values(PayrollStatus) as string[]).includes(maybeStatus)
          ? (maybeStatus as PayrollStatus)
          : undefined;

      const filters = {
        periodMonth: req.query.month ? Number(req.query.month) : undefined,
        periodYear: req.query.year ? Number(req.query.year) : undefined,
        status,
        department: req.query.department as string,
        search: req.query.search as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await payrollService.getPayrollRecords(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Get statistics
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month
        ? Number(req.query.month)
        : new Date().getMonth() + 1;
      const year = req.query.year
        ? Number(req.query.year)
        : new Date().getFullYear();

      const stats = await payrollService.getPayrollStats(month, year);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // Get single record
  async getRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await payrollService.getPayrollRecord(req.params.id);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }

  // Update record
  async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updatePayrollSchema.parse(req.body);

      const updated = await payrollService.updatePayrollRecord(id, data);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  // Generate payroll for period
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = generatePayrollSchema.parse(req.body);
      const result = await payrollService.generatePayroll(month, year);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Bulk actions
  async bulkAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, action } = bulkActionSchema.parse(req.body);
      let result;

      switch (action) {
        case "approve":
          result = await payrollService.bulkStatusUpdate(ids, "processed");
          break;
        case "pay":
          result = await payrollService.bulkStatusUpdate(ids, "paid");
          break;
        case "email":
          result = await payrollService.sendPayslips(ids);
          break;
      }

      res.json({ success: true, result });
    } catch (error) {
      next(error);
    }
  }
}
