import { PrismaClient, Prisma, Transaction } from '@prisma/client';
import { WebhookService } from './webhook.service';

interface PayBillParams {
  userId: string;
  payeeId: string;
  amount: number;
  accountId: string;
  reference?: string | undefined;
  paymentDate?: string | Date | undefined;
}

interface PayBillVerifiedParams extends PayBillParams {
  documentPath: string;
}

export class BillService {
  private prisma: PrismaClient;
  private webhookService: WebhookService;

  constructor() {
    this.prisma = new PrismaClient();
    this.webhookService = new WebhookService();
  }

  async getVerificationThreshold(): Promise<number> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: 'payment_verification_threshold' },
    });
    return config ? Number(config.value) : 10000;
  }

  async processPayment(params: PayBillParams): Promise<{
    success: boolean;
    transaction?: Transaction;
    requiresVerification?: boolean;
    threshold?: number;
    error?: string;
    message?: string;
  }> {
    const { userId, payeeId, amount, accountId, reference } = params;

    // Check Threshold
    const threshold = await this.getVerificationThreshold();
    if (amount > threshold) {
      return {
        success: false,
        requiresVerification: true,
        threshold,
        error: 'Verification Required',
        message: `Payments over $${threshold.toLocaleString()} require verification document.`,
      };
    }

    // Verify account
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) return { success: false, error: 'Account not found' };

    if (account.balance.lt(amount)) return { success: false, error: 'Insufficient funds' };

    // Verify payee
    const payee = await this.prisma.billPayee.findFirst({
      where: { id: payeeId, userId },
    });
    if (!payee) return { success: false, error: 'Payee not found' };

    const txReference = reference || `BP-${Date.now()}`;

    const transaction = await this.prisma.$transaction(async tx => {
      // Deduct
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      });

      // Create transaction
      return tx.transaction.create({
        data: {
          accountId,
          type: 'PAYMENT',
          amount: new Prisma.Decimal(-amount), // Negative for outflow
          currency: account.currency,
          status: 'COMPLETED',
          category: payee.category, // Auto-categorize
          description: `Bill Payment to ${payee.name}`,
          reference: txReference,
          processedAt: new Date(),
        },
      });
    });

    // Send Webhook if reference indicates it's a UHI invoice
    if (reference && reference.startsWith('INV-')) {
      this.webhookService.sendPaymentNotification({
        invoiceNumber: reference,
        amount: amount,
        transactionRef: transaction.id,
        paymentDate: new Date().toISOString(),
      });
    }

    return { success: true, transaction, message: 'Payment successful' };
  }

  async processVerifiedPayment(params: PayBillVerifiedParams): Promise<{
    success: boolean;
    transaction?: Transaction;
    error?: string;
    message?: string;
  }> {
    const { userId, payeeId, amount, accountId, documentPath } = params;

    if (amount <= 0) return { success: false, error: 'Invalid amount' };

    // Verify account
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) return { success: false, error: 'Account not found' };

    if (account.balance.lt(amount)) return { success: false, error: 'Insufficient funds' };

    // Verify payee
    const payee = await this.prisma.billPayee.findFirst({
      where: { id: payeeId, userId },
    });
    if (!payee) return { success: false, error: 'Payee not found' };

    const transaction = await this.prisma.$transaction(async tx => {
      // Deduct to reserve funds
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { decrement: amount } },
      });

      const txRecord = await tx.transaction.create({
        data: {
          accountId,
          type: 'PAYMENT',
          amount: new Prisma.Decimal(-amount),
          currency: account.currency,
          status: 'PENDING_VERIFICATION',
          category: payee.category,
          description: `Bill Payment to ${payee.name} (Pending Verification)`,
          reference: `BPV-${Date.now()}`,
        },
      });

      await tx.paymentVerification.create({
        data: {
          transactionId: txRecord.id,
          documentPath: documentPath || 'mock_path.pdf',
          documentType: 'DOCUMENT',
          status: 'PENDING',
        },
      });

      return txRecord;
    });

    return { success: true, transaction, message: 'Payment submitted for verification' };
  }
}
