import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateTokens } from '../../shared/utils/jwt';
import { AppError } from '../../shared/middleware/errorHandler.middleware';
import { LoginDTO, RegisterDTO } from './auth.types';
import { generateResetToken, hashResetToken, generateTokenExpiry } from '../../shared/utils/crypto';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../../shared/utils/email';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export class AuthService {

    async login(data: LoginDTO) {
        const { staffId, password } = data;

        // Find user by staff ID or email (flexible login)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { staff_id: staffId },
                    { email: staffId } // Allow email as login identifier
                ]
            },
            include: { roles: { include: { role: true } } }
        });

        if (!user || user.status !== 'active') {
            throw new AppError('Invalid credentials or account inactive', 401);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // 2FA Verification
        if (user.is_two_factor_enabled) {
            if (!data.twoFactorToken) {
                // Return immediate error indicating 2FA is required
                throw new AppError('Two-factor authentication required', 403);
            }

            try {
                const isValid = authenticator.verify({
                    token: data.twoFactorToken,
                    secret: user.two_factor_secret || ''
                });

                if (!isValid) {
                    throw new AppError('Invalid 2FA token', 401);
                }
            } catch (err) {
                if (err instanceof AppError) throw err;
                throw new AppError('Invalid 2FA token', 401);
            }
        }

        // Generate tokens
        // For simplicity, we'll take the first role or strongest role. 
        // In a real app we might handle multiple roles differently in the token or UI.
        // Here assuming 1 main role for the token claim or a list.
        const mainRole = user.roles.length > 0 ? user.roles[0].role.name : 'staff';

        const tokens = generateTokens({
            userId: user.id,
            staffId: user.staff_id,
            role: mainRole
        });

        // Update last login or similar if tracked (not in schema yet, skipping)

        return {
            user: {
                id: user.id,
                staffId: user.staff_id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: mainRole,
                avatarUrl: user.avatar_url,
                isTwoFactorEnabled: user.is_two_factor_enabled
            },
            ...tokens
        };
    }

    // Basic registration for admin usage (or self-register if we enabled it, but usually admin creates staff)
    async register(data: RegisterDTO) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { staff_id: data.staffId },
                    { email: data.email }
                ]
            }
        });

        if (existingUser) {
            throw new AppError('User already exists with this Staff ID or Email', 409);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Transaction to create user and assign role
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.create({
                data: {
                    staff_id: data.staffId,
                    email: data.email,
                    password_hash: hashedPassword,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    status: 'active'
                }
            });

            // Assign default role (staff)
            const staffRole = await tx.role.findUnique({ where: { name: 'staff' } });
            if (staffRole) {
                await tx.userRole.create({
                    data: {
                        user_id: user.id,
                        role_id: staffRole.id
                    }
                });
            }

            return user;
        });

        return this.login({ staffId: data.staffId, password: data.password });
    }

    async refreshToken(refreshToken: string) {
        // Verify the refresh token
        const { verifyToken } = await import('../../shared/utils/jwt');

        try {
            const payload = verifyToken(refreshToken);

            // Verify user still exists and is active
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                include: { roles: { include: { role: true } } }
            });

            if (!user || user.status !== 'active') {
                throw new AppError('User not found or inactive', 401);
            }

            const mainRole = user.roles.length > 0 ? user.roles[0].role.name : 'staff';

            // Generate new tokens
            const tokens = generateTokens({
                userId: user.id,
                staffId: user.staff_id,
                role: mainRole
            });

            return tokens;
        } catch (error) {
            throw new AppError('Invalid or expired refresh token', 401);
        }
    }

    /**
     * Initiate password reset - sends email with reset link
     */
    async forgotPassword(email: string) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always return success to prevent email enumeration attacks
        if (!user || user.status !== 'active') {
            // Log for debugging but don't reveal to user
            console.log(`Password reset requested for non-existent/inactive email: ${email}`);
            return { message: 'If an account with that email exists, a password reset link has been sent.' };
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const hashedToken = hashResetToken(resetToken);
        const expiresAt = generateTokenExpiry(1); // 1 hour

        // Save hashed token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_reset_token: hashedToken,
                password_reset_expires: expiresAt
            }
        });

        // Send email with plain token (we store hashed version)
        await sendPasswordResetEmail(user.email, resetToken, user.first_name);

        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    /**
     * Reset password using token from email
     */
    async resetPassword(token: string, newPassword: string) {
        // Hash the provided token to compare with stored hash
        const hashedToken = hashResetToken(token);

        // Find user with matching token that hasn't expired
        const user = await prisma.user.findFirst({
            where: {
                password_reset_token: hashedToken,
                password_reset_expires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            throw new AppError('Invalid or expired reset token', 400);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                password_reset_token: null,
                password_reset_expires: null
            }
        });

        // Send confirmation email
        await sendPasswordChangedEmail(user.email, user.first_name);

        return { message: 'Password has been reset successfully. You can now log in with your new password.' };
    }

    /**
     * Change password for authenticated user
     */
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 401);
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedPassword }
        });

        // Send confirmation email
        await sendPasswordChangedEmail(user.email, user.first_name);

        return { message: 'Password changed successfully.' };
    }

    async setupTwoFactor(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'UHI Staff Portal', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        await prisma.user.update({
            where: { id: userId },
            data: { two_factor_secret: secret }
        });

        return { secret, qrCodeUrl };
    }

    async enableTwoFactor(userId: string, token: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.two_factor_secret) throw new AppError('2FA setup not initiated', 400);

        const isValid = authenticator.verify({ token, secret: user.two_factor_secret });
        if (!isValid) throw new AppError('Invalid token', 400);

        await prisma.user.update({
            where: { id: userId },
            data: { is_two_factor_enabled: true }
        });

        return { message: 'Two-factor authentication enabled successfully' };
    }

    async disableTwoFactor(userId: string) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                is_two_factor_enabled: false,
                two_factor_secret: null
            }
        });
        return { message: 'Two-factor authentication disabled' };
    }
}

export const authService = new AuthService();

