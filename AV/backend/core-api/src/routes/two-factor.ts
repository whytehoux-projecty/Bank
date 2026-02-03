import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import twoFactorAuthService from '../services/two-factor-auth.service';

const verifyTokenSchema = z.object({
    token: z.string().length(6),
});

export default async function twoFactorRoutes(fastify: FastifyInstance) {
    // Setup 2FA - Generate QR code
    fastify.post(
        '/setup',
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: 'Setup Two-Factor Authentication',
                tags: ['2FA'],
                security: [{ bearerAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const user = request.user as any;

                const setup = await twoFactorAuthService.generateSecret(
                    user.userId,
                    user.email
                );

                reply.send({
                    success: true,
                    data: {
                        qrCode: setup.qrCodeUrl,
                        secret: setup.secret,
                        backupCodes: setup.backupCodes,
                    },
                    message: 'Scan the QR code with your authenticator app',
                });
            } catch (error) {
                fastify.log.error('2FA setup error:', error);
                reply.status(500).send({
                    success: false,
                    error: 'Failed to setup 2FA',
                });
            }
        }
    );

    // Enable 2FA - Verify and activate
    fastify.post(
        '/enable',
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: 'Enable Two-Factor Authentication',
                tags: ['2FA'],
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['token'],
                    properties: {
                        token: { type: 'string', minLength: 6, maxLength: 6 },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const user = request.user as any;
                const { token } = verifyTokenSchema.parse(request.body);

                const isValid = await twoFactorAuthService.enableTwoFactor(
                    user.userId,
                    token
                );

                if (!isValid) {
                    return reply.status(400).send({
                        success: false,
                        error: 'Invalid verification code',
                    });
                }

                reply.send({
                    success: true,
                    message: 'Two-Factor Authentication enabled successfully',
                });
            } catch (error) {
                fastify.log.error('2FA enable error:', error);
                reply.status(500).send({
                    success: false,
                    error: 'Failed to enable 2FA',
                });
            }
        }
    );

    // Verify 2FA token (during login)
    fastify.post(
        '/verify',
        {
            schema: {
                description: 'Verify Two-Factor Authentication token',
                tags: ['2FA'],
                body: {
                    type: 'object',
                    required: ['userId', 'token'],
                    properties: {
                        userId: { type: 'string' },
                        token: { type: 'string' },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { userId, token } = request.body as any;

                const isValid = await twoFactorAuthService.verifyToken(userId, token);

                if (!isValid) {
                    return reply.status(401).send({
                        success: false,
                        error: 'Invalid 2FA code',
                    });
                }

                reply.send({
                    success: true,
                    message: '2FA verification successful',
                });
            } catch (error) {
                fastify.log.error('2FA verify error:', error);
                reply.status(500).send({
                    success: false,
                    error: 'Failed to verify 2FA',
                });
            }
        }
    );

    // Disable 2FA
    fastify.post(
        '/disable',
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: 'Disable Two-Factor Authentication',
                tags: ['2FA'],
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['password'],
                    properties: {
                        password: { type: 'string' },
                    },
                },
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const user = request.user as any;
                const { password } = request.body as any;

                const success = await twoFactorAuthService.disableTwoFactor(
                    user.userId,
                    password
                );

                if (!success) {
                    return reply.status(400).send({
                        success: false,
                        error: 'Failed to disable 2FA',
                    });
                }

                reply.send({
                    success: true,
                    message: 'Two-Factor Authentication disabled',
                });
            } catch (error) {
                fastify.log.error('2FA disable error:', error);
                reply.status(500).send({
                    success: false,
                    error: 'Failed to disable 2FA',
                });
            }
        }
    );

    // Regenerate backup codes
    fastify.post(
        '/backup-codes/regenerate',
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: 'Regenerate 2FA backup codes',
                tags: ['2FA'],
                security: [{ bearerAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const user = request.user as any;

                const backupCodes = await twoFactorAuthService.regenerateBackupCodes(
                    user.userId
                );

                reply.send({
                    success: true,
                    data: { backupCodes },
                    message: 'Backup codes regenerated. Save them securely!',
                });
            } catch (error) {
                fastify.log.error('Backup codes regeneration error:', error);
                reply.status(500).send({
                    success: false,
                    error: 'Failed to regenerate backup codes',
                });
            }
        }
    );

    // Check 2FA status
    fastify.get(
        '/status',
        {
            preHandler: [fastify.authenticate],
            schema: {
                description: 'Check 2FA status',
                tags: ['2FA'],
                security: [{ bearerAuth: [] }],
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const user = request.user as any;

                const isEnabled = await twoFactorAuthService.isTwoFactorEnabled(
                    user.userId
                );

                reply.send({
                    success: true,
                    data: { twoFactorEnabled: isEnabled },
                });
            } catch (error) {
                fastify.log.error('2FA status check error:', error);
                reply.status(500).send({
                    success: false,
                    error: 'Failed to check 2FA status',
                });
            }
        }
    );
}
