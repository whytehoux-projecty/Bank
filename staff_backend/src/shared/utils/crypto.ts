import crypto from 'crypto';

/**
 * Generate a secure random token for password reset
 */
export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a reset token for secure storage
 */
export const hashResetToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate expiry time (default 1 hour from now)
 */
export const generateTokenExpiry = (hoursFromNow: number = 1): Date => {
    return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
};
