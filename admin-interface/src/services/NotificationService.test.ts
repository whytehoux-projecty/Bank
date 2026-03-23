
import { NotificationService } from './NotificationService';
import crypto from 'crypto';

// Setup fetch mock
global.fetch = jest.fn();

describe('NotificationService', () => {
    const mockSecret = 'test-secret';
    const mockUrl = 'http://test-staff-portal.com/webhook';

    // We need to access private static fields via 'any' or by setting env vars before
    // Since static fields are initialized at import time, setting process.env now might not work if it's already imported
    // But let's try assuming the service reads env vars dynamically or we re-import.
    // Actually, the class implementation reads env vars at definition time for static props.
    // For unit testing, we might need to rely on the fact that we can't easily change private static fields without reflection or ts-ignore.
    // Or we verify behavior given the default/mock values.

    beforeAll(() => {
        // Mock console to keep output clean
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('notifyStaffPortal', () => {
        // Access private fields for testing setup if needed, or rely on environment variables set in test runner config
        // Here we'll just test the logic flow.

        it('should verify signature generation and fetch call', async () => {
            const transactionId = 'txn-1';
            const status = 'COMPLETED';
            const reference = 'REF-123';
            const amount = 500;
            const invoiceNumber = 'INV-123';

            // Spy/Mock private fields workaround (typescript way)
            (NotificationService as any).WEBHOOK_SECRET = mockSecret;
            (NotificationService as any).STAFF_PORTAL_URL = mockUrl;

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200
            });

            await NotificationService.notifyStaffPortal(transactionId, status, reference, amount, invoiceNumber);

            // const expectedPayload = {
            //     transactionRef: reference,
            //     status: status,
            //     invoiceNumber: invoiceNumber,
            //     amount: amount,
            //     timestamp: expect.any(String)
            // };

            // Calculate expected signature
            // We need to capture the exact payload passed to verify signature, 
            // since timestamp changes.
            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const url = fetchCall[0];
            const options = fetchCall[1];
            const sentBody = JSON.parse(options.body);

            expect(url).toBe(mockUrl);
            expect(options.method).toBe('POST');
            expect(sentBody).toEqual(expect.objectContaining({
                transactionRef: reference,
                status,
                invoiceNumber,
                amount
            }));

            const expectedSignature = crypto
                .createHmac('sha256', mockSecret)
                .update(options.body)
                .digest('hex');

            expect(options.headers['x-webhook-signature']).toBe(expectedSignature);
        });

        it('should retry on failure', async () => {
            (NotificationService as any).WEBHOOK_SECRET = mockSecret;
            (NotificationService as any).STAFF_PORTAL_URL = mockUrl;

            // Mock fetch to fail twice then succeed
            (global.fetch as jest.Mock)
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Timeout'))
                .mockResolvedValue({ ok: true });

            jest.spyOn(global, 'setTimeout'); // Timer validation logic would be good

            await NotificationService.notifyStaffPortal('tx', 'COMPLETED', 'ref', 100, 'inv');

            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        it('should not send if status is not COMPLETED or APPROVED', async () => {
            await NotificationService.notifyStaffPortal('tx', 'PENDING', 'ref', 100, 'inv');
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should not send if invoiceNumber is null', async () => {
            await NotificationService.notifyStaffPortal('tx', 'COMPLETED', 'ref', 100, null);
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });
});
