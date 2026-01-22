import axios from 'axios';
import crypto from 'crypto';
import logger from '../lib/logger';

interface WebhookPayload {
  invoiceNumber: string;
  amount: number;
  transactionRef: string;
  paymentDate: string;
}

export class WebhookService {
  private readonly secret: string;
  private readonly uhiUrl: string;

  constructor() {
    this.secret = process.env['WEBHOOK_SECRET'] || 'default-secret-key';
    this.uhiUrl = process.env['UHI_WEBHOOK_URL'] || 'http://localhost:3000/api/webhook/payment';
  }

  async sendPaymentNotification(payload: WebhookPayload): Promise<void> {
    try {
      const signature = this.generateSignature(payload);
      const body = { ...payload, signature };

      logger.info(`Sending webhook to ${this.uhiUrl}`, { invoice: payload.invoiceNumber });

      await axios.post(this.uhiUrl, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        timeout: 5000,
      });

      logger.info('Webhook sent successfully');
    } catch (error) {
      logger.error('Failed to send webhook', error);
      // We don't throw here to avoid failing the user's payment response,
      // but in production we might want a retry queue.
    }
  }

  private generateSignature(payload: WebhookPayload): string {
    const data = `${payload.invoiceNumber}${payload.amount}${payload.transactionRef}${payload.paymentDate}`;
    return crypto.createHmac('sha256', this.secret).update(data).digest('hex');
  }
}
