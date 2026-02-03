import { TwoFactorAuthService } from '../../services/two-factor-auth.service';
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Mock dependencies
const mPrismaClient: any = {
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock('speakeasy', () => ({
    generateSecret: jest.fn(),
    totp: {
        verify: jest.fn(),
    }
}));

jest.mock('qrcode', () => ({
    toDataURL: jest.fn(),
}));

describe('TwoFactorAuthService', () => {
    let service: TwoFactorAuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TwoFactorAuthService();
    });

    describe('generateSecret', () => {
        it('should generate secret and qr code', async () => {
            (speakeasy.generateSecret as jest.Mock).mockReturnValue({
                otpauth_url: 'otpauth://test',
                base32: 'SECRET32'
            });
            (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,...');
            mPrismaClient.user.update.mockResolvedValue({});

            const result = await service.generateSecret('user-1', 'test@test.com');
            expect(result.secret).toBe('SECRET32');
            expect(result.qrCodeUrl).toBeDefined();
            expect(result.backupCodes).toHaveLength(10);
            expect(mPrismaClient.user.update).toHaveBeenCalled();
        });
    });

    describe('enableTwoFactor', () => {
        it('should throw error if 2fa not setup', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ twoFactorSecret: null });
            await expect(service.enableTwoFactor('user-1', '123456'))
                .rejects.toThrow('2FA not set up');
        });

        it('should enable 2fa if token valid', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ twoFactorSecret: 'SECRET' });
            (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

            const result = await service.enableTwoFactor('user-1', '123456');
            expect(result).toBe(true);
            expect(mPrismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { twoFactorEnabled: true }
            }));
        });

        it('should return false if token invalid', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ twoFactorSecret: 'SECRET' });
            (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

            const result = await service.enableTwoFactor('user-1', '123456');
            expect(result).toBe(false);
        });
    });

    describe('verifyToken', () => {
        it('should return false if 2fa not enabled', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ twoFactorEnabled: false });
            const result = await service.verifyToken('user-1', '123456');
            expect(result).toBe(false);
        });

        it('should verify with TOTP', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                twoFactorEnabled: true, twoFactorSecret: 'SECRET'
            });
            (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

            const result = await service.verifyToken('user-1', '123456');
            expect(result).toBe(true);
        });

        it('should verify with backup code', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                twoFactorEnabled: true,
                twoFactorSecret: 'SECRET',
                twoFactorBackupCodes: JSON.stringify(['BACKUP1'])
            });
            (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

            const result = await service.verifyToken('user-1', 'BACKUP1');
            expect(result).toBe(true);
            // Should verify backup code is removed
            expect(mPrismaClient.user.update).toHaveBeenCalled();
            const updateCall = mPrismaClient.user.update.mock.calls[0][0];
            expect(updateCall.data.twoFactorBackupCodes).toBe('[]');
        });

        it('should return false if invalid token and backup code', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                twoFactorEnabled: true,
                twoFactorSecret: 'SECRET',
                twoFactorBackupCodes: JSON.stringify(['BACKUP1'])
            });
            (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

            const result = await service.verifyToken('user-1', 'WRONG');
            expect(result).toBe(false);
        });
    });

    describe('disableTwoFactor', () => {
        it('should disable 2fa', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ id: 'user-1' });

            const result = await service.disableTwoFactor('user-1', 'pass');
            expect(result).toBe(true);
            expect(mPrismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ twoFactorEnabled: false })
            }));
        });
    });

    describe('regenerateBackupCodes', () => {
        it('should regenerate backup codes', async () => {
            const result = await service.regenerateBackupCodes('user-1');
            expect(result).toHaveLength(10);
            expect(mPrismaClient.user.update).toHaveBeenCalled();
        });
    });

    describe('isTwoFactorEnabled', () => {
        it('should return status', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ twoFactorEnabled: true });
            const result = await service.isTwoFactorEnabled('user-1');
            expect(result).toBe(true);
        });
    });
});
