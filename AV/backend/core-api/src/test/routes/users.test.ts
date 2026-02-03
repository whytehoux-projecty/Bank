import { fastify, setupApp } from '../../server';
import { UserService } from '../../services/userService';
import { authenticateToken } from '../../middleware/auth';

// Mock the Service
jest.mock('../../services/userService', () => ({
    UserService: {
        getUsers: jest.fn(),
        getUserById: jest.fn(),
        createUser: jest.fn(),
        updateUserProfile: jest.fn(),
        suspendUser: jest.fn(),
        reactivateUser: jest.fn(),
        getUserStatistics: jest.fn(),
    },
}));

// Mock Database
jest.mock('../../lib/database', () => ({
    __esModule: true,
    default: {
        connect: jest.fn(),
        disconnect: jest.fn(),
        prisma: {
            user: { findUnique: jest.fn() },
        },
        redis: {
            on: jest.fn(),
            connect: jest.fn(),
        }
    },
    connect: jest.fn(),
}));

// Mock Auth Middleware
jest.mock('../../middleware/auth', () => ({
    authenticateToken: jest.fn((req, _reply) => {
        // Default behavior: Authenticate as admin
        req.user = { userId: 'admin-123', email: 'admin@example.com' };
        req.admin = { id: 'admin-123', permissions: ['*'] }; // Add admin object for admin routes
        return Promise.resolve();
    }),
}));

// Mock other routes to avoid dependency resolution issues
jest.mock('../../routes/transactions', () => async () => { });
jest.mock('../../routes/auth', () => async () => { });
jest.mock('../../routes/accounts', () => async () => { });
jest.mock('../../routes/kyc', () => async () => { });
jest.mock('../../routes/wire-transfers', () => async () => { });
jest.mock('../../routes/system', () => async () => { });
jest.mock('../../routes/portal', () => async () => { });
jest.mock('../../routes/bills', () => async () => { });
jest.mock('../../routes/transfers', () => async () => { });
jest.mock('../../routes/admin/verifications', () => async () => { });

describe('User Routes', () => {
    beforeAll(async () => {
        await setupApp();
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset default auth mock
        (authenticateToken as jest.Mock).mockImplementation((req, _reply) => {
            req.user = { userId: 'admin-123', email: 'admin@example.com' };
            return Promise.resolve();
        });
    });

    // 1. Get Users
    describe('GET /api/users', () => {
        it('should return 200 and list of users', async () => {
            const mockResult = {
                users: [{ id: 'u1', email: 'test@test.com' }],
                pagination: { total: 1, pages: 1, page: 1, limit: 10 }
            };
            (UserService.getUsers as jest.Mock).mockResolvedValue(mockResult);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/users',
                query: { page: '1', limit: '10' }
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({
                success: true,
                data: mockResult.users,
                pagination: mockResult.pagination
            });
            expect(UserService.getUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }));
        });

        it('should return 400 for invalid query', async () => {
            const response = await fastify.inject({
                method: 'GET',
                url: '/api/users',
                query: { page: 'invalid' } // Zod expects number transformable
            });
            expect(response.statusCode).toBe(400); // validationSchemas.userQuery.parse will fail
        });
    });

    // 2. Get User By ID
    describe('GET /api/users/:id', () => {
        it('should return 200 and user data', async () => {
            const mockUser = { id: 'u1', email: 't@t.com' };
            (UserService.getUserById as jest.Mock).mockResolvedValue(mockUser);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/users/u1'
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload).data).toEqual(mockUser);
        });

        it('should return 404 if user not found via service error', async () => {
            (UserService.getUserById as jest.Mock).mockRejectedValue(new Error('User not found'));

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/users/u999'
            });

            expect(response.statusCode).toBe(404);
        });
    });

    // 3. Create User
    describe('POST /api/users', () => {
        const newUserCtx = {
            email: 'new@test.com',
            password: 'Password123!',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+15551234567',
            dateOfBirth: '1990-01-01T00:00:00Z',
            role: 'USER',
            address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'US'
            }
        };

        it('should return 201 on success', async () => {
            (UserService.createUser as jest.Mock).mockResolvedValue({ id: 'new1', ...newUserCtx });

            const response = await fastify.inject({
                method: 'POST',
                url: '/api/users',
                payload: newUserCtx
            });

            // Note: If schema validation fails due to missing fields, this will be 400.
            // Assuming adminCreateUser schema matches payload.
            // If response is 400, I will debug schema.
            // Keeping payload simple for now.
            expect(response.statusCode).toBe(201);
        });
    });

    // 4. Update User
    describe('PUT /api/users/:id', () => {
        it('should update user successfully', async () => {
            (UserService.updateUserProfile as jest.Mock).mockResolvedValue({ id: 'u1', firstName: 'Updated' });

            const response = await fastify.inject({
                method: 'PUT',
                url: '/api/users/u1',
                payload: { firstName: 'Updated' }
            });

            expect(response.statusCode).toBe(200);
            expect(UserService.updateUserProfile).toHaveBeenCalledWith('u1', expect.objectContaining({ firstName: 'Updated' }));
        });
    });

    // 5. Suspend/Activate
    describe('POST /api/users/:id/suspend', () => {
        it('should suspend user', async () => {
            (UserService.suspendUser as jest.Mock).mockResolvedValue({ id: 'u1', status: 'SUSPENDED' });

            const response = await fastify.inject({
                method: 'POST',
                url: '/api/users/u1/suspend'
            });

            expect(response.statusCode).toBe(200);
        });
    });

    describe('POST /api/users/:id/activate', () => {
        it('should activate user', async () => {
            (UserService.reactivateUser as jest.Mock).mockResolvedValue({ id: 'u1', status: 'ACTIVE' });

            const response = await fastify.inject({
                method: 'POST',
                url: '/api/users/u1/activate'
            });

            expect(response.statusCode).toBe(200);
        });
    });

    // 6. Statistics
    describe('GET /api/users/statistics', () => {
        it('should return statistics', async () => {
            const mockStats = { totalUsers: 10, activeUsers: 5 };
            (UserService.getUserStatistics as jest.Mock).mockResolvedValue(mockStats);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/users/statistics'
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload).data).toEqual(mockStats);
        });
    });
});
