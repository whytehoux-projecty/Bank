/**
 * Authentication API Integration Tests
 * 
 * Tests REAL authentication flows with:
 * - Real database connections
 * - Real user credentials
 * - Real JWT token generation
 * - Real password hashing
 * 
 * NO MOCKING - All tests use actual API and database
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: TEST_CONFIG.database.connectionString,
        },
    },
});

describe('Authentication API - Real Integration Tests', () => {
    let testUserId: string;
    let authToken: string;
    let refreshToken: string;
    let csrfToken: string;

    beforeAll(async () => {
        // Ensure test database is connected
        await prisma.$connect();
    });

    afterAll(async () => {
        // Cleanup: Delete test user if created
        if (testUserId) {
            await prisma.user.delete({ where: { id: testUserId } }).catch(() => { });
        }
        await prisma.$disconnect();
    });

    describe('POST /api/v1/csrf-token', () => {
        it('should generate real CSRF token', async () => {
            const response = await request(app)
                .get('/api/v1/csrf-token')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.csrfToken).toBeDefined();
            expect(typeof response.body.csrfToken).toBe('string');
            expect(response.body.csrfToken.length).toBeGreaterThan(0);

            // Store for later use
            csrfToken = response.body.csrfToken;

            // Verify token is stored in Redis (real check)
            // This would require Redis client, but we verify through usage
        });
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register new user with real database insertion', async () => {
            const userData = {
                email: `test.${Date.now()}@uhi.org`,
                password: 'TestPassword123!',
                firstName: 'Test',
                lastName: 'User',
                phone: '+256700000000',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('X-CSRF-Token', csrfToken)
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.firstName).toBe(userData.firstName);
            expect(response.body.user.lastName).toBe(userData.lastName);
            expect(response.body.token).toBeDefined();

            testUserId = response.body.user.id;

            // Verify user exists in REAL database
            const dbUser = await prisma.user.findUnique({
                where: { id: testUserId },
            });

            expect(dbUser).not.toBeNull();
            expect(dbUser?.email).toBe(userData.email);
            expect(dbUser?.firstName).toBe(userData.firstName);

            // Verify password is hashed (not plain text)
            expect(dbUser?.password).not.toBe(userData.password);
            const passwordMatch = await bcrypt.compare(userData.password, dbUser!.password);
            expect(passwordMatch).toBe(true);
        });

        it('should reject duplicate email with real database constraint', async () => {
            const userData = {
                email: 'staff.test@uhi.org', // Existing test user
                password: 'TestPassword123!',
                firstName: 'Duplicate',
                lastName: 'User',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('X-CSRF-Token', csrfToken)
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('email');
        });

        it('should validate password strength', async () => {
            const userData = {
                email: `weak.${Date.now()}@uhi.org`,
                password: '123', // Weak password
                firstName: 'Test',
                lastName: 'User',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('X-CSRF-Token', csrfToken)
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('password');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login with real credentials and generate JWT', async () => {
            const credentials = {
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: TEST_CONFIG.auth.testUsers.staff.password,
            };

            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send(credentials)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(credentials.email);

            // Store tokens for later tests
            authToken = response.body.token;
            refreshToken = response.body.refreshToken;

            // Verify token is valid JWT
            expect(authToken.split('.').length).toBe(3); // JWT has 3 parts

            // Verify lastLoginAt is updated in REAL database
            const dbUser = await prisma.user.findUnique({
                where: { email: credentials.email },
            });

            expect(dbUser?.lastLoginAt).not.toBeNull();
            expect(new Date(dbUser!.lastLoginAt!).getTime()).toBeGreaterThan(
                Date.now() - 60000 // Within last minute
            );
        });

        it('should reject invalid credentials', async () => {
            const credentials = {
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: 'WrongPassword123!',
            };

            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send(credentials)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid');
        });

        it('should reject non-existent user', async () => {
            const credentials = {
                email: 'nonexistent@uhi.org',
                password: 'Password123!',
            };

            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send(credentials)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject inactive user', async () => {
            // Create inactive user in real database
            const inactiveUser = await prisma.user.create({
                data: {
                    email: `inactive.${Date.now()}@uhi.org`,
                    password: await bcrypt.hash('Password123!', 10),
                    firstName: 'Inactive',
                    lastName: 'User',
                    role: 'STAFF',
                    isActive: false,
                },
            });

            const credentials = {
                email: inactiveUser.email,
                password: 'Password123!',
            };

            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send(credentials)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('inactive');

            // Cleanup
            await prisma.user.delete({ where: { id: inactiveUser.id } });
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        it('should refresh token with real refresh token', async () => {
            // First login to get tokens
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: TEST_CONFIG.auth.testUsers.staff.email,
                    password: TEST_CONFIG.auth.testUsers.staff.password,
                });

            const oldRefreshToken = loginResponse.body.refreshToken;

            // Wait a bit to ensure new token is different
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Refresh token
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .set('X-CSRF-Token', csrfToken)
                .send({ refreshToken: oldRefreshToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.token).not.toBe(loginResponse.body.token);
        });

        it('should reject invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .set('X-CSRF-Token', csrfToken)
                .send({ refreshToken: 'invalid.token.here' })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        it('should logout and invalidate tokens in real Redis', async () => {
            // Login first
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: TEST_CONFIG.auth.testUsers.staff.email,
                    password: TEST_CONFIG.auth.testUsers.staff.password,
                });

            const token = loginResponse.body.token;

            // Logout
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .set('X-CSRF-Token', csrfToken)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify token is invalidated by trying to use it
            const protectedResponse = await request(app)
                .get('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(401);

            expect(protectedResponse.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/forgot-password', () => {
        it('should generate real password reset token', async () => {
            const response = await request(app)
                .post('/api/v1/auth/forgot-password')
                .set('X-CSRF-Token', csrfToken)
                .send({ email: TEST_CONFIG.auth.testUsers.staff.email })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('reset');

            // Verify reset token is stored in REAL database
            const dbUser = await prisma.user.findUnique({
                where: { email: TEST_CONFIG.auth.testUsers.staff.email },
            });

            expect(dbUser?.passwordResetToken).toBeDefined();
            expect(dbUser?.passwordResetExpires).toBeDefined();
            expect(new Date(dbUser!.passwordResetExpires!).getTime()).toBeGreaterThan(Date.now());
        });

        it('should handle non-existent email gracefully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/forgot-password')
                .set('X-CSRF-Token', csrfToken)
                .send({ email: 'nonexistent@uhi.org' })
                .expect(200); // Don't reveal if email exists

            expect(response.body.success).toBe(true);
        });
    });

    describe('POST /api/v1/auth/reset-password', () => {
        it('should reset password with real token', async () => {
            // Generate reset token
            const resetToken = 'test-reset-token-' + Date.now();
            const resetExpires = new Date(Date.now() + 3600000); // 1 hour

            await prisma.user.update({
                where: { email: TEST_CONFIG.auth.testUsers.staff.email },
                data: {
                    passwordResetToken: resetToken,
                    passwordResetExpires: resetExpires,
                },
            });

            const newPassword = 'NewPassword123!';

            const response = await request(app)
                .post('/api/v1/auth/reset-password')
                .set('X-CSRF-Token', csrfToken)
                .send({
                    token: resetToken,
                    password: newPassword,
                })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify password is changed in REAL database
            const dbUser = await prisma.user.findUnique({
                where: { email: TEST_CONFIG.auth.testUsers.staff.email },
            });

            const passwordMatch = await bcrypt.compare(newPassword, dbUser!.password);
            expect(passwordMatch).toBe(true);

            // Verify reset token is cleared
            expect(dbUser?.passwordResetToken).toBeNull();
            expect(dbUser?.passwordResetExpires).toBeNull();

            // Reset password back to original for other tests
            await prisma.user.update({
                where: { email: TEST_CONFIG.auth.testUsers.staff.email },
                data: {
                    password: await bcrypt.hash(TEST_CONFIG.auth.testUsers.staff.password, 10),
                },
            });
        });

        it('should reject expired reset token', async () => {
            const resetToken = 'expired-token-' + Date.now();
            const resetExpires = new Date(Date.now() - 3600000); // 1 hour ago

            await prisma.user.update({
                where: { email: TEST_CONFIG.auth.testUsers.staff.email },
                data: {
                    passwordResetToken: resetToken,
                    passwordResetExpires: resetExpires,
                },
            });

            const response = await request(app)
                .post('/api/v1/auth/reset-password')
                .set('X-CSRF-Token', csrfToken)
                .send({
                    token: resetToken,
                    password: 'NewPassword123!',
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('expired');
        });
    });

    describe('Rate Limiting', () => {
        it('should enforce rate limiting on login attempts', async () => {
            const credentials = {
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: 'WrongPassword',
            };

            // Make multiple failed login attempts
            const attempts = [];
            for (let i = 0; i < 10; i++) {
                attempts.push(
                    request(app)
                        .post('/api/v1/auth/login')
                        .set('X-CSRF-Token', csrfToken)
                        .send(credentials)
                );
            }

            const responses = await Promise.all(attempts);

            // At least one should be rate limited
            const rateLimited = responses.some(r => r.status === 429);
            expect(rateLimited).toBe(true);
        });
    });
});
