import { prisma } from "../../config/database";
import crypto from "crypto";
import { AppError } from "../../shared/middleware/errorHandler.middleware";
import { loanService } from "../finance/loan.service";

export class WebhookService {
  private secret = process.env.WEBHOOK_SECRET || "default-secret-change-me";

  verifySignature(payload: unknown, signature: string): boolean {
    const rawPayload =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    const hmac = crypto.createHmac("sha256", this.secret);
    const digest = hmac.update(rawPayload).digest("hex");
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(digest, "hex"),
      );
    } catch {
      return false;
    }
  }

  async processPayment(data: {
    invoiceNumber: string;
    amount: number;
    transactionRef: string;
    timestamp: string;
  }) {
    const { invoiceNumber, amount, transactionRef } = data;

    // 1. Find Invoice
    const invoice = await prisma.loanInvoice.findUnique({
      where: { invoice_number: invoiceNumber },
      include: { loan: true },
    });

    if (!invoice) {
      throw new AppError("Invoice not found", 404);
    }

    if (invoice.status === "paid") {
      return { message: "Invoice already paid", invoice };
    }

    if (
      typeof (invoice as { amount?: unknown }).amount === "number" ||
      (invoice as { amount?: unknown }).amount != null
    ) {
      const expectedAmount = Number((invoice as { amount?: unknown }).amount);
      const paidAmount = Number(amount);
      if (
        !Number.isFinite(expectedAmount) ||
        !Number.isFinite(paidAmount) ||
        Math.abs(expectedAmount - paidAmount) > 0.01
      ) {
        throw new AppError("Payment amount mismatch", 400);
      }
    }

    // 2. Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update Invoice
      const updatedInvoice = await tx.loanInvoice.update({
        where: { id: invoice.id },
        data: {
          status: "paid",
          paid_at: new Date(),
          payment_transaction_ref: transactionRef,
        },
      });

      // Update Loan Balance
      const currentBalance = Number(invoice.loan.balance);
      const payAmount = Number(amount);
      const newBalance = currentBalance - payAmount;
      const loanStatus = newBalance <= 0.01 ? "paid_off" : "active";

      await tx.loan.update({
        where: { id: invoice.loan_id },
        data: {
          balance: newBalance,
          status: loanStatus,
        },
      });

      // Create Payment Record
      await tx.loanPayment.create({
        data: {
          loan_id: invoice.loan_id,
          amount: amount,
          payment_reference: transactionRef,
          payment_method: "aurum_vault_transfer",
          status: "confirmed",
          confirmed_at: new Date(),
        },
      });

      return { updatedInvoice, newBalance };
    });

    // Send Email Notification outside transaction
    if (invoice.loan) {
      try {
        await loanService.sendPaymentConfirmationEmail(invoice.loan.user_id, {
          amount: amount,
          reference: transactionRef,
          loanId: invoice.loan.id,
          newBalance: Number(result.newBalance ?? invoice.loan.balance),
        });
      } catch (error) {
        console.error("Failed to send email notification from webhook", error);
      }
    }

    return result.updatedInvoice;
  }
}

export const webhookService = new WebhookService();
