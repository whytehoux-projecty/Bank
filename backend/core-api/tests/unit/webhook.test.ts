import axios from 'axios';
import crypto from 'crypto';
import { WebhookService } from '../../src/services/webhook.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebhookService', () => {
  let webhookService: WebhookService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env['WEBHOOK_SECRET'] = 'test-secret';
    process.env['UHI_WEBHOOK_URL'] = 'http://test-uhi.com/webhook';
    webhookService = new WebhookService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should send payment notification with correct signature', async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 });

    const payload = {
      invoiceNumber: 'INV-123',
      amount: 1000,
      transactionRef: 'TX-999',
      paymentDate: '2024-01-01T00:00:00.000Z',
    };

    await webhookService.sendPaymentNotification(payload);

    // Verify Axios call
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const callArgs = mockedAxios.post.mock.calls[0];
    if (!callArgs) throw new Error('Axios post was not called');
    const url = callArgs[0];
    const body = callArgs[1];
    const config = callArgs[2];

    expect(url).toBe('http://test-uhi.com/webhook');
    expect(body).toEqual(expect.objectContaining(payload));
    expect(config?.headers?.['X-Webhook-Signature']).toBeDefined();

    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', 'test-secret')
      .update(
        `${payload.invoiceNumber}${payload.amount}${payload.transactionRef}${payload.paymentDate}`
      )
      .digest('hex');

    expect(config?.headers?.['X-Webhook-Signature']).toBe(expectedSignature);
  });

  it('should log error but not throw if webhook fails', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Network Error'));

    await expect(
      webhookService.sendPaymentNotification({
        invoiceNumber: 'INV-FAIL',
        amount: 500,
        transactionRef: 'TX-FAIL',
        paymentDate: new Date().toISOString(),
      })
    ).resolves.not.toThrow();

    expect(mockedAxios.post).toHaveBeenCalled();
  });
});
