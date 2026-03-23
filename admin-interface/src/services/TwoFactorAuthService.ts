import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

interface TOTPSecret {
    base32: string;
    otpauth_url: string;
}

interface TwoFactorSetupResult {
    secret: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
}

interface TwoFactorVerifyResult {
    verified: boolean;
    usedBackupCode?: boolean;
}

class TwoFactorAuthServiceClass {
    private readonly ISSUER = 'JP Heritage Bank Admin';
    private readonly BACKUP_CODES_COUNT = 10;

    /**
     * Generate a new TOTP secret for a user
     */
    generateSecret(userEmail: string): TOTPSecret {
        const secret = speakeasy.generateSecret({
            name: `${this.ISSUER}:${userEmail}`,
            issuer: this.ISSUER,
            length: 32
        });

        return {
            base32: secret.base32,
            otpauth_url: secret.otpauth_url || ''
        };
    }

    /**
     * Generate QR code as data URL for TOTP setup
     */
    async generateQRCode(otpauthUrl: string): Promise<string> {
        try {
            return await QRCode.toDataURL(otpauthUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#1A1A2E',
                    light: '#FFFFFF'
                }
            });
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    /**
     * Generate secure backup codes
     */
    generateBackupCodes(): string[] {
        const codes: string[] = [];

        for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
            // Generate 8-character alphanumeric code
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
        }

        return codes;
    }

    /**
     * Hash backup codes for storage
     */
    // private hashBackupCodes(codes: string[]): string[] {
    //     return codes.map(code =>
    //         crypto.createHash('sha256').update(code.replace('-', '')).digest('hex')
    //     );
    // }

    /**
     * Setup 2FA for an admin user
     */
    async setup(adminUserId: string, email: string): Promise<TwoFactorSetupResult> {
        // Generate TOTP secret
        const secret = this.generateSecret(email);

        // Generate QR code
        const qrCodeDataUrl = await this.generateQRCode(secret.otpauth_url);

        // Generate backup codes
        const backupCodes = this.generateBackupCodes();
        // const _hashedBackupCodes = this.hashBackupCodes(backupCodes);

        // Persist the unconfirmed secret in SystemConfig using a per-user key.
        // Key: "2fa_pending_secret:<adminUserId>" — not activated until verify() confirms it.
        await prisma.systemConfig.upsert({
            where: { key: `2fa_pending_secret:${adminUserId}` },
            update: { value: secret.base32, updatedBy: adminUserId },
            create: {
                key: `2fa_pending_secret:${adminUserId}`,
                value: secret.base32,
                description: 'Pending 2FA TOTP secret (not yet confirmed)',
                updatedBy: adminUserId
            }
        });

        // Also store backup codes (hashed) against this pending setup
        const hashedCodes = backupCodes.map(c =>
            crypto.createHash('sha256').update(c.replace('-', '')).digest('hex')
        );
        await prisma.systemConfig.upsert({
            where: { key: `2fa_pending_backup_codes:${adminUserId}` },
            update: { value: JSON.stringify(hashedCodes), updatedBy: adminUserId },
            create: {
                key: `2fa_pending_backup_codes:${adminUserId}`,
                value: JSON.stringify(hashedCodes),
                description: 'Pending 2FA backup codes (not yet confirmed)',
                updatedBy: adminUserId
            }
        });

        return {
            secret: secret.base32,
            qrCodeDataUrl,
            backupCodes
        };
    }

    /**
     * Verify TOTP token during setup or login
     */
    verifyToken(secret: string, token: string): boolean {
        try {
            return speakeasy.totp.verify({
                secret: secret,
                encoding: 'base32',
                token: token,
                window: 2 // Allow 1 step before and after for clock drift
            });
        } catch (error) {
            console.error('TOTP verification error:', error);
            return false;
        }
    }

    /**
     * Verify 2FA during login or during initial setup confirmation
     */
    async verify(adminUserId: string, token: string): Promise<TwoFactorVerifyResult> {
        const admin = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
        if (!admin) return { verified: false };

        // Check for an active secret first (normal login flow)
        const secretRecord = await prisma.systemConfig.findUnique({
            where: { key: `2fa_secret:${adminUserId}` }
        });

        if (!secretRecord) {
            // No active secret — check for a pending secret (initial setup confirmation)
            const pendingRecord = await prisma.systemConfig.findUnique({
                where: { key: `2fa_pending_secret:${adminUserId}` }
            });

            if (!pendingRecord) {
                // 2FA not enabled for this user — verification passes
                return { verified: true };
            }

            // Validate token against the pending secret
            if (this.verifyToken(pendingRecord.value, token)) {
                // Promote pending → active
                await prisma.systemConfig.upsert({
                    where: { key: `2fa_secret:${adminUserId}` },
                    update: { value: pendingRecord.value, updatedBy: adminUserId },
                    create: {
                        key: `2fa_secret:${adminUserId}`,
                        value: pendingRecord.value,
                        description: '2FA TOTP secret (active)',
                        updatedBy: adminUserId
                    }
                });
                await prisma.systemConfig.upsert({
                    where: { key: `2fa_enabled:${adminUserId}` },
                    update: { value: 'true', updatedBy: adminUserId },
                    create: {
                        key: `2fa_enabled:${adminUserId}`,
                        value: 'true',
                        description: '2FA enabled flag',
                        updatedBy: adminUserId
                    }
                });
                // Promote pending backup codes → active
                const pendingBackup = await prisma.systemConfig.findUnique({
                    where: { key: `2fa_pending_backup_codes:${adminUserId}` }
                });
                if (pendingBackup) {
                    await prisma.systemConfig.upsert({
                        where: { key: `2fa_backup_codes:${adminUserId}` },
                        update: { value: pendingBackup.value, updatedBy: adminUserId },
                        create: {
                            key: `2fa_backup_codes:${adminUserId}`,
                            value: pendingBackup.value,
                            description: '2FA backup codes (hashed)',
                            updatedBy: adminUserId
                        }
                    });
                    await prisma.systemConfig.delete({ where: { key: `2fa_pending_backup_codes:${adminUserId}` } }).catch(() => {});
                }
                await prisma.systemConfig.delete({ where: { key: `2fa_pending_secret:${adminUserId}` } }).catch(() => {});
                return { verified: true };
            }
            return { verified: false };
        }

        // Normal login: validate token against the active secret
        if (this.verifyToken(secretRecord.value, token)) {
            return { verified: true };
        }

        // Try backup code
        const backupRecord = await prisma.systemConfig.findUnique({
            where: { key: `2fa_backup_codes:${adminUserId}` }
        });
        const backupCodes: string[] = backupRecord ? JSON.parse(backupRecord.value) : [];
        const hashedToken = crypto.createHash('sha256').update(token.replace('-', '')).digest('hex');
        const idx = backupCodes.findIndex(c => c === hashedToken);
        if (idx !== -1) {
            backupCodes.splice(idx, 1);
            await prisma.systemConfig.update({
                where: { key: `2fa_backup_codes:${adminUserId}` },
                data: { value: JSON.stringify(backupCodes), updatedBy: adminUserId }
            });
            return { verified: true, usedBackupCode: true };
        }

        return { verified: false };
    }

    /**
     * Enable 2FA — called after the initial verify() confirms the token.
     * verify() already promotes pending→active, so this is a lightweight alias.
     */
    async enable(adminUserId: string, secret: string, token: string, _backupCodes: string[]): Promise<boolean> {
        if (!this.verifyToken(secret, token)) return false;
        const result = await this.verify(adminUserId, token);
        return result.verified;
    }

    /**
     * Disable 2FA for an admin user — clears all SystemConfig keys
     */
    async disable(adminUserId: string, _password: string): Promise<boolean> {
        const admin = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
        if (!admin) return false;

        const keys = [
            `2fa_secret:${adminUserId}`,
            `2fa_pending_secret:${adminUserId}`,
            `2fa_enabled:${adminUserId}`,
            `2fa_backup_codes:${adminUserId}`,
            `2fa_pending_backup_codes:${adminUserId}`
        ];
        await Promise.all(
            keys.map(key => prisma.systemConfig.delete({ where: { key } }).catch(() => {}))
        );
        console.info(`[2FA] Disabled for admin ${adminUserId}`);
        return true;
    }

    /**
     * Regenerate backup codes for an admin who already has 2FA enabled
     */
    async regenerateBackupCodes(adminUserId: string): Promise<string[] | null> {
        const isOn = await this.isEnabled(adminUserId);
        if (!isOn) return null;

        const newCodes = this.generateBackupCodes();
        const hashed = newCodes.map(c =>
            crypto.createHash('sha256').update(c.replace('-', '')).digest('hex')
        );
        await prisma.systemConfig.upsert({
            where: { key: `2fa_backup_codes:${adminUserId}` },
            update: { value: JSON.stringify(hashed), updatedBy: adminUserId },
            create: {
                key: `2fa_backup_codes:${adminUserId}`,
                value: JSON.stringify(hashed),
                description: '2FA backup codes (hashed)',
                updatedBy: adminUserId
            }
        });
        return newCodes;
    }

    /**
     * Check if 2FA is enabled for a user
     */
    async isEnabled(adminUserId: string): Promise<boolean> {
        const record = await prisma.systemConfig.findUnique({
            where: { key: `2fa_enabled:${adminUserId}` }
        });
        return record?.value === 'true';
    }
}

export const TwoFactorAuthService = new TwoFactorAuthServiceClass();
