import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Mock dependencies
const mPrismaClient: any = {
    userSession: {
        findFirst: jest.fn(),
        update: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    adminUser: {
        findUnique: jest.fn(),
    },
    account: {
        findFirst: jest.fn(),
    },
    transaction: {
        findFirst: jest.fn(),
    }
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    const sendMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ send: sendMock });
    const logErrorMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            headers: {},
            log: { error: logErrorMock } as any
        };
        mockReply = {
            status: statusMock,
            send: sendMock,
        };
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('authenticateToken', () => {
        it('should return 401 if no token', async () => {
            await authenticateToken(mockRequest as FastifyRequest, mockReply as FastifyReply);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'TOKEN_INVALID' }));
        });

        it('should return 401 if token invalid', async () => {
            mockRequest.headers = { authorization: 'Bearer invalid' };
            (jwt.verify as jest.Mock).mockImplementation(() => { throw new jwt.JsonWebTokenError('invalid'); });

            await authenticateToken(mockRequest as FastifyRequest, mockReply as FastifyReply);
            expect(statusMock).toHaveBeenCalledWith(401);
        });

        it('should return 401 if session not found', async () => {
            mockRequest.headers = { authorization: 'Bearer valid' };
            (jwt.verify as jest.Mock).mockReturnValue({ userId: 'u1' });
            mPrismaClient.userSession.findFirst.mockResolvedValue(null);

            await authenticateToken(mockRequest as FastifyRequest, mockReply as FastifyReply);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'TOKEN_EXPIRED' }));
        });

        it('should return 403 if user suspended', async () => {
            mockRequest.headers = { authorization: 'Bearer valid' };
            (jwt.verify as jest.Mock).mockReturnValue({ userId: 'u1' });
            mPrismaClient.userSession.findFirst.mockResolvedValue({
                id: 's1',
                user: { status: 'SUSPENDED' }
            });

            await authenticateToken(mockRequest as FastifyRequest, mockReply as FastifyReply);
            expect(statusMock).toHaveBeenCalledWith(403);
            expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'ACCOUNT_SUSPENDED' }));
        });

        it('should attach user to request on success', async () => {
            mockRequest.headers = { authorization: 'Bearer valid' };
            (jwt.verify as jest.Mock).mockReturnValue({ userId: 'u1' });
            mPrismaClient.userSession.findFirst.mockResolvedValue({
                id: 's1',
                user: { id: 'u1', email: 'e', status: 'ACTIVE' }
            });

            await authenticateToken(mockRequest as FastifyRequest, mockReply as FastifyReply);
            expect((mockRequest as any).user).toBeDefined();
            expect(mPrismaClient.userSession.update).toHaveBeenCalled();
        });
    });
});
