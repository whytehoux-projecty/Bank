import { generateResetToken, hashResetToken, generateTokenExpiry } from '../src/shared/utils/crypto';

describe('Crypto Utilities', () => {
    describe('generateResetToken', () => {
        it('should generate a random hex string', () => {
            const token = generateResetToken();

            expect(typeof token).toBe('string');
            expect(token.length).toBe(64); // 32 bytes = 64 hex chars
            expect(/^[0-9a-f]+$/i.test(token)).toBe(true);
        });

        it('should generate unique tokens', () => {
            const token1 = generateResetToken();
            const token2 = generateResetToken();

            expect(token1).not.toBe(token2);
        });
    });

    describe('hashResetToken', () => {
        it('should return a SHA256 hash of the input', () => {
            const token = 'test_token';
            const hash = hashResetToken(token);

            expect(typeof hash).toBe('string');
            expect(hash.length).toBe(64); // SHA256 = 64 hex chars
        });

        it('should return consistent hash for same input', () => {
            const token = 'test_token';
            const hash1 = hashResetToken(token);
            const hash2 = hashResetToken(token);

            expect(hash1).toBe(hash2);
        });

        it('should return different hash for different input', () => {
            const hash1 = hashResetToken('token1');
            const hash2 = hashResetToken('token2');

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('generateTokenExpiry', () => {
        it('should return a Date object', () => {
            const expiry = generateTokenExpiry();

            expect(expiry).toBeInstanceOf(Date);
        });

        it('should default to 1 hour in the future', () => {
            const now = Date.now();
            const expiry = generateTokenExpiry();
            const oneHourLater = now + 60 * 60 * 1000;

            // Allow 1 second tolerance
            expect(expiry.getTime()).toBeGreaterThan(oneHourLater - 1000);
            expect(expiry.getTime()).toBeLessThan(oneHourLater + 1000);
        });

        it('should respect custom hours parameter', () => {
            const now = Date.now();
            const expiry = generateTokenExpiry(24);
            const twentyFourHoursLater = now + 24 * 60 * 60 * 1000;

            // Allow 1 second tolerance
            expect(expiry.getTime()).toBeGreaterThan(twentyFourHoursLater - 1000);
            expect(expiry.getTime()).toBeLessThan(twentyFourHoursLater + 1000);
        });
    });
});
