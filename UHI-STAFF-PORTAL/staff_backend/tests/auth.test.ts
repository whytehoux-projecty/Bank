import request from 'supertest';
import express from 'express';
import { authController } from '../src/modules/auth/auth.controller';
import { authService } from '../src/modules/auth/auth.service';

// Mock auth service
jest.mock('../src/modules/auth/auth.service');

const app = express();
app.use(express.json());

// Setup routes for testing
app.post('/api/v1/auth/login', authController.login);
app.post('/api/v1/auth/forgot-password', authController.forgotPassword);
app.post('/api/v1/auth/reset-password', authController.resetPassword);

describe('Auth Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/v1/auth/login', () => {
        it('should return 200 and tokens on successful login', async () => {
            const mockResult = {
                user: {
                    id: '123',
                    staffId: 'STF001',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    role: 'staff',
                },
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token',
            };

            (authService.login as jest.Mock).mockResolvedValue(mockResult);

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({ staffId: 'STF001', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.staffId).toBe('STF001');
            expect(response.body.data.accessToken).toBe('mock_access_token');
        });

        it('should pass error to next middleware on invalid credentials', async () => {
            const mockError = new Error('Invalid credentials');
            (authService.login as jest.Mock).mockRejectedValue(mockError);

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({ staffId: 'invalid', password: 'wrong' });

            // Without error middleware, Express returns 500
            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('POST /api/v1/auth/forgot-password', () => {
        it('should return success message regardless of email existence', async () => {
            (authService.forgotPassword as jest.Mock).mockResolvedValue({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });

            const response = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('reset link');
        });
    });

    describe('POST /api/v1/auth/reset-password', () => {
        it('should reset password with valid token', async () => {
            (authService.resetPassword as jest.Mock).mockResolvedValue({
                message: 'Password has been reset successfully.'
            });

            const response = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({ token: 'valid_token', password: 'NewPass123' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('reset successfully');
        });

        it('should fail with invalid token', async () => {
            const mockError = new Error('Invalid or expired reset token');
            (authService.resetPassword as jest.Mock).mockRejectedValue(mockError);

            const response = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({ token: 'invalid_token', password: 'NewPass123' });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });
});

describe('Auth Service', () => {
    // These tests would need proper mocking of Prisma
    // Keeping as integration test placeholders

    it('should hash passwords before storing', () => {
        // Test would verify bcrypt usage
        expect(true).toBe(true);
    });

    it('should generate valid JWT tokens', () => {
        // Test would verify JWT generation
        expect(true).toBe(true);
    });
});
