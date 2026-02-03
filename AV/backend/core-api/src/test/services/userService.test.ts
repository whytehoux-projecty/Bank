import { UserService } from '../../services/userService';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Mock dependencies
const mPrismaClient: any = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
    },
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('../../shared/index', () => ({
    ERROR_CODES: {
        USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
        INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
        ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
        ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
        USER_NOT_FOUND: 'USER_NOT_FOUND',
    },
    AUTH_CONFIG: {
        BCRYPT_ROUNDS: 10,
        MAX_LOGIN_ATTEMPTS: 3,
        LOCKOUT_DURATION: 300000,
    },
    BUSINESS_RULES: {
        MIN_AGE: 18,
    }
}));

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        const mockUserData = {
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date('2000-01-01'), // > 18 years
        };

        it('should throw error if user already exists', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ id: 'user-1' });
            await expect(UserService.createUser(mockUserData))
                .rejects.toThrow('USER_ALREADY_EXISTS');
        });

        it('should throw error if user is underage', async () => {
            const underageData = { ...mockUserData, dateOfBirth: new Date() };
            await expect(UserService.createUser(underageData))
                .rejects.toThrow('User must be at least 18 years old');
        });

        it('should create user successfully', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            mPrismaClient.user.create.mockResolvedValue({ id: 'user-new', ...mockUserData });

            const result = await UserService.createUser(mockUserData);
            expect(result).toBeDefined();
            expect(mPrismaClient.user.create).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalled();
        });
    });

    describe('authenticateUser', () => {
        it('should throw error if user not found', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue(null);
            await expect(UserService.authenticateUser('test@example.com', 'pass'))
                .rejects.toThrow('INVALID_CREDENTIALS');
        });

        it('should throw error if account locked', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                id: 'user-1',
                lockedUntil: new Date(Date.now() + 10000)
            });
            await expect(UserService.authenticateUser('test@example.com', 'pass'))
                .rejects.toThrow('ACCOUNT_LOCKED');
        });

        it('should throw error if account suspended', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                id: 'user-1',
                status: 'SUSPENDED'
            });
            await expect(UserService.authenticateUser('test@example.com', 'pass'))
                .rejects.toThrow('ACCOUNT_SUSPENDED');
        });

        it('should throw error if password invalid', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                id: 'user-1',
                password: 'hashed',
                status: 'ACTIVE'
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(UserService.authenticateUser('test@example.com', 'pass'))
                .rejects.toThrow('INVALID_CREDENTIALS');
            expect(mPrismaClient.user.update).toHaveBeenCalled(); // handleFailedLogin
        });

        it('should authenticate successfully', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                id: 'user-1',
                password: 'hashed',
                status: 'ACTIVE'
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await UserService.authenticateUser('test@example.com', 'pass');
            expect(mPrismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ loginAttempts: 0 })
            }));
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({ id: 'user-1', password: 'old_hash' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');

            await UserService.changePassword('user-1', 'old', 'new');
            expect(mPrismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { password: 'new_hash' }
            }));
        });
    });

    describe('getAllUsers', () => {
        it('should return users with filters', async () => {
            mPrismaClient.user.findMany.mockResolvedValue([]);
            mPrismaClient.user.count.mockResolvedValue(0);
            const result = await UserService.getUsers({ search: 'test' });
            expect(result).toBeDefined();
        });
    });

    describe('suspendUser', () => {
        it('should suspend user', async () => {
            mPrismaClient.user.update.mockResolvedValue({ id: 'user-1', status: 'SUSPENDED' });
            const result = await UserService.suspendUser('user-1', 'reason');
            expect(result.status).toBe('SUSPENDED');
        });
    });
});
