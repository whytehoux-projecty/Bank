import crypto from 'crypto';

export class NotificationService {
    private static STAFF_PORTAL_URL = process.env['STAFF_PORTAL_API_URL'] || 'http://localhost:3000/api/v1/webhooks/payments';
    private static WEBHOOK_SECRET = process.env['WEBHOOK_SECRET'] || 'default-secret-change-me';

    static async notifyCustomer(userEmail: string, type: 'APPROVED' | 'REJECTED', details: any) {
        const status = type === 'APPROVED' ? 'Approved' : 'Rejected';
        const emailContent = {
            to: userEmail,
            subject: `Payment Verification ${status}`,
            body: `Your payment with reference ${details.reference} has been ${status.toLowerCase()}.${details.reason ? ' Reason: ' + details.reason : ''}`
        };

        if (process.env['SMTP_HOST']) {
            try {
                // nodemailer is an optional runtime dependency — not in package.json by default.
                // Install via: npm install nodemailer @types/nodemailer
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    host: process.env['SMTP_HOST'],
                    port: parseInt(process.env['SMTP_PORT'] || '587', 10),
                    secure: process.env['SMTP_PORT'] === '465',
                    auth: {
                        user: process.env['SMTP_USER'],
                        pass: process.env['SMTP_PASS']
                    }
                });
                await transporter.sendMail({
                    from: process.env['SMTP_USER'],
                    to: emailContent.to,
                    subject: emailContent.subject,
                    text: emailContent.body
                });
                console.info('[EMAIL] Sent successfully to', userEmail);
            } catch (err) {
                // Email failure must never crash the payment verification flow
                console.error('[EMAIL] Failed to send:', err);
            }
        } else {
            // SMTP not configured — emit structured log for observability/dev review
            console.info('[EMAIL]', JSON.stringify(emailContent));
        }
    }

    static async notifyStaffPortal(_transactionId: string, status: string, reference: string, amount: number, invoiceNumber: string | null) {
        if (status !== 'COMPLETED' && status !== 'APPROVED') {
            // Usually we only sync successful payments to update invoice status
            // But maybe we want to sync rejections if the staff portal marked it as "processing"?
            // For now, assuming we sync success.
            return;
        }

        if (!invoiceNumber) {
            console.warn('[WEBHOOK] No invoice number provided, skipping webhook.');
            return;
        }

        console.log(`[WEBHOOK] Preparing to send to ${this.STAFF_PORTAL_URL}`);

        const payload = {
            transactionRef: reference,
            status,
            invoiceNumber,
            amount: Number(amount), // Ensure number
            timestamp: new Date().toISOString()
        };

        const signature = crypto
            .createHmac('sha256', this.WEBHOOK_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');

        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                // Determine fetch availability (Node 18+ has global fetch)
                const response = await fetch(this.STAFF_PORTAL_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-webhook-signature': signature
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }

                console.log('[WEBHOOK] Delivered successfully');
                return;
            } catch (error) {
                attempts++;
                console.error(`[WEBHOOK] Attempt ${attempts} failed:`, error);
                if (attempts < maxRetries) {
                    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts))); // Exponential backoff: 2s, 4s, 8s
                }
            }
        }

        console.error('[WEBHOOK] Final failure. Webhook could not be delivered.');
    }
}
