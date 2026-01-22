import crypto from 'crypto';

export class NotificationService {
    private static STAFF_PORTAL_URL = process.env['STAFF_PORTAL_API_URL'] || 'http://localhost:3000/api/v1/webhooks/payments';
    private static WEBHOOK_SECRET = process.env['WEBHOOK_SECRET'] || 'default-secret-change-me';

    static async notifyCustomer(userEmail: string, type: 'APPROVED' | 'REJECTED', details: any) {
        // Mock email sending
        console.log(`[EMAIL SENT] To: ${userEmail}`);
        console.log(`Subject: Payment Verification ${type === 'APPROVED' ? 'Successful' : 'Failed'}`);
        console.log(`Body: Your payment with reference ${details.reference} has been ${type.toLowerCase()}.`);
        if (details.reason) {
            console.log(`Reason: ${details.reason}`);
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
