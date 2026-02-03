import { WebhookService } from '../../services/webhook.service';
import axios from 'axios';
import crypto from 'crypto';

jest.mock('axios');
jest.mock('../lib/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

describe('WebhookService', () => {
    let webhookService: WebhookService;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.WEBHOOK_SECRET = 'test-secret';
        process.env.UHI_WEBHOOK_URL = 'http://test.url';
        webhookService = new WebhookService();
    });

    describe('sendPaymentNotification', () => {
        const payload = {
            invoiceNumber: 'INV-123',
            amount: 100,
            transactionRef: 'tx-1',
            paymentDate: '2023-01-01'
        };

        it('should send webhook with correct signature', async () => {
            (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

            await webhookService.sendPaymentNotification(payload);

            const expectedData = `${payload.invoiceNumber}${payload.amount}${payload.transactionRef}${payload.paymentDate}`;
            const expectedSignature = crypto.createHmac('sha256', 'test-secret').update(expectedData).digest('hex');

            expect(axios.post).toHaveBeenCalledWith(
                'http://test.url',
                expect.objectContaining({
                    ...payload,
                    signature: expectedSignature
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Webhook-Signature': expectedSignature
                    })
                })
            );
        });

        it('should log error but not throw if request fails', async () => {
            (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

            await expect(webhookService.sendPaymentNotification(payload)).resolves.not.toThrow();
        });
    });
});
