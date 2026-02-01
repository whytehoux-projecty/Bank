import { generateTokens, verifyToken } from '../src/shared/utils/jwt';

describe('JWT Utilities', () => {
    const mockPayload = {
        userId: 'test-user-123',
        staffId: 'STF001',
        role: 'staff' as const,
    };

    describe('generateTokens', () => {
        it('should generate both access and refresh tokens', () => {
            const tokens = generateTokens(mockPayload);

            expect(tokens).toHaveProperty('accessToken');
            expect(tokens).toHaveProperty('refreshToken');
            expect(typeof tokens.accessToken).toBe('string');
            expect(typeof tokens.refreshToken).toBe('string');
        });

        it('should generate different tokens for different payloads', () => {
            const tokens1 = generateTokens(mockPayload);
            const tokens2 = generateTokens({ ...mockPayload, userId: 'different-user' });

            expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
            expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
        });
    });

    describe('verifyToken', () => {
        it('should verify and decode a valid token', () => {
            const tokens = generateTokens(mockPayload);
            const decoded = verifyToken(tokens.accessToken);

            expect(decoded.userId).toBe(mockPayload.userId);
            expect(decoded.staffId).toBe(mockPayload.staffId);
            expect(decoded.role).toBe(mockPayload.role);
        });

        it('should throw error for invalid token', () => {
            expect(() => verifyToken('invalid_token')).toThrow();
        });

        it('should throw error for malformed token', () => {
            expect(() => verifyToken('not.a.valid.jwt')).toThrow();
        });
    });
});
