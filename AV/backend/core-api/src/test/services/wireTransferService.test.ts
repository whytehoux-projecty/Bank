import { WireTransferService } from '../../services/wireTransferService';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
const mPrismaClient: any = {
    account: {
        findFirst: jest.fn(),
        update: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
        update: jest.fn(),
    },
    wireTransfer: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mPrismaClient)),
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock('../../shared/index', () => ({
    ERROR_CODES: {
        ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
        WIRE_TRANSFER_NOT_FOUND: 'WIRE_TRANSFER_NOT_FOUND',
    },
    WIRE_TRANSFER_CONFIG: {
        MIN_AMOUNT: 10,
        MAX_AMOUNT: 10000,
        DAILY_LIMIT: 50000,
        BASE_FEE: 15,
        PERCENTAGE_FEE: 0.01,
        FOREIGN_CURRENCY_FEE: 25,
        MAX_FEE: 500,
        DOMESTIC_PROCESSING_DAYS: 1,
        INTERNATIONAL_PROCESSING_DAYS: 3,
    }
}));

describe('WireTransferService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createWireTransfer', () => {
        const mockTransferData = {
            senderAccountId: 'acc-1',
            amount: 100,
            currency: 'USD',
            recipientName: 'John Doe',
            recipientBankName: 'Bank of America',
            recipientAccountNumber: '1234567890',
        };

        it('should throw error if amount is below minimum', async () => {
            await expect(WireTransferService.createWireTransfer('user-1', {
                ...mockTransferData,
                amount: 5
            })).rejects.toThrow('Minimum wire transfer amount');
        });

        it('should throw error if account not found', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue(null);
            await expect(WireTransferService.createWireTransfer('user-1', mockTransferData))
                .rejects.toThrow('ACCOUNT_NOT_FOUND');
        });

        it('should throw error if KYC not verified', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                user: { kycStatus: 'PENDING' }
            });
            await expect(WireTransferService.createWireTransfer('user-1', mockTransferData))
                .rejects.toThrow('KYC verification required');
        });

        it('should throw error if insufficient funds', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                user: { kycStatus: 'VERIFIED' },
                balance: { toNumber: () => 50 } // Less than 100 + fee
            });
            await expect(WireTransferService.createWireTransfer('user-1', mockTransferData))
                .rejects.toThrow('Insufficient funds');
        });

        it('should create wire transfer successfully', async () => {
            mPrismaClient.account.findFirst.mockResolvedValue({
                id: 'acc-1',
                user: { kycStatus: 'VERIFIED' },
                balance: { toNumber: () => 1000 }
            });
            mPrismaClient.wireTransfer.findMany.mockResolvedValue([]); // No daily transfers

            mPrismaClient.transaction.create.mockResolvedValue({ id: 'tx-1' });
            mPrismaClient.wireTransfer.create.mockResolvedValue({ id: 'wt-1' });

            const result = await WireTransferService.createWireTransfer('user-1', mockTransferData);

            expect(result).toBeDefined();
            expect(mPrismaClient.transaction.create).toHaveBeenCalled();
            expect(mPrismaClient.wireTransfer.create).toHaveBeenCalled();
            expect(mPrismaClient.account.update).toHaveBeenCalled();
            expect(mPrismaClient.auditLog.create).toHaveBeenCalled();
        });
    });

    describe('getUserWireTransfers', () => {
        it('should return wire transfers with pagination', async () => {
            mPrismaClient.wireTransfer.findMany.mockResolvedValue([{ id: 'wt-1' }]);
            mPrismaClient.wireTransfer.count.mockResolvedValue(1);

            const result = await WireTransferService.getUserWireTransfers('user-1');
            expect(result.wireTransfers).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
        });
    });

    describe('getWireTransferById', () => {
        it('should return wire transfer if found', async () => {
            mPrismaClient.wireTransfer.findFirst.mockResolvedValue({ id: 'wt-1' });
            const result = await WireTransferService.getWireTransferById('wt-1', 'user-1');
            expect(result).toBeDefined();
        });

        it('should throw error if not found', async () => {
            mPrismaClient.wireTransfer.findFirst.mockResolvedValue(null);
            await expect(WireTransferService.getWireTransferById('wt-1', 'user-1'))
                .rejects.toThrow('WIRE_TRANSFER_NOT_FOUND');
        });
    });

    describe('cancelWireTransfer', () => {
        it('should cancel pending wire transfer', async () => {
            mPrismaClient.wireTransfer.findFirst.mockResolvedValue({
                id: 'wt-1',
                senderAccountId: 'acc-1',
                transactionId: 'tx-1',
                transaction: { status: 'PENDING', amount: 100, reference: 'REF' }
            });

            await WireTransferService.cancelWireTransfer('wt-1', 'user-1');

            expect(mPrismaClient.transaction.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'tx-1' },
                data: expect.objectContaining({ status: 'CANCELLED' })
            }));
            expect(mPrismaClient.account.update).toHaveBeenCalled(); // Refund
        });

        it('should throw error if not pending', async () => {
            mPrismaClient.wireTransfer.findFirst.mockResolvedValue({
                id: 'wt-1',
                transaction: { status: 'COMPLETED' }
            });
            await expect(WireTransferService.cancelWireTransfer('wt-1', 'user-1'))
                .rejects.toThrow('Can only cancel pending wire transfers');
        });
    });

    describe('getWireTransferStats', () => {
        it('should return stats', async () => {
            mPrismaClient.wireTransfer.findMany.mockResolvedValue([
                { transaction: { amount: 100 } }
            ]);
            mPrismaClient.wireTransfer.count.mockResolvedValue(1);

            const result = await WireTransferService.getWireTransferStats('user-1');
            expect(result.today.amount).toBe(100);
            expect(result.total.count).toBe(1);
        });
    });
});
