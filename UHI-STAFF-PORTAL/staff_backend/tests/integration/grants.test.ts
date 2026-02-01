import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import jwt from 'jsonwebtoken';

// Mock auth middleware to bypass actual JWT verification if needed, 
// or simpler: generate a valid token signed with the test secret.
const TEST_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing';

const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role, staffId: 'staff-123' }, TEST_SECRET, { expiresIn: '1h' });
};

const mockUser = {
    id: 'user-123',
    role: 'staff',
    email: 'test@example.com'
};

const mockAdmin = {
    id: 'admin-123',
    role: 'admin',
    email: 'admin@example.com'
};

const mockGrant = {
    id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
    user_id: mockUser.id,
    amount: 5000,
    category: 'Education',
    reason: 'Test Grant',
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date(),
};

describe('Grant API Endpoints', () => {
    let userToken: string;
    let adminToken: string;

    beforeAll(() => {
        userToken = generateToken(mockUser.id, mockUser.role);
        adminToken = generateToken(mockAdmin.id, mockAdmin.role);
    });

    describe('POST /api/v1/finance/grants', () => {
        it('should allow staff to apply for a grant', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (prisma.grant.create as jest.Mock).mockResolvedValue(mockGrant);

            const res = await request(app)
                .post('/api/v1/finance/grants')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    amount: 5000,
                    category: 'Education',
                    reason: 'Test Grant'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.amount).toBe(5000);
            expect(prisma.grant.create).toHaveBeenCalled();
        });

        it('should return 400 for invalid input', async () => {
            const res = await request(app)
                .post('/api/v1/finance/grants')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    amount: -100, // Invalid amount
                    category: 'Education',
                    reason: 'Test Grant'
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/finance/grants', () => {
        it('should return user grants', async () => {
            (prisma.grant.findMany as jest.Mock).mockResolvedValue([mockGrant]);

            const res = await request(app)
                .get('/api/v1/finance/grants')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].id).toBe(mockGrant.id);
        });
    });

    describe('GET /api/v1/admin/grants', () => {
        it('should return all grants for admin', async () => {
            (prisma.grant.findMany as jest.Mock).mockResolvedValue([mockGrant]);

            const res = await request(app)
                .get('/api/v1/admin/grants')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });

        it('should deny access for non-admin', async () => {
            const res = await request(app)
                .get('/api/v1/admin/grants')
                .set('Authorization', `Bearer ${userToken}`);

            if (res.status !== 403) {
                console.log('403 Test Failed:', res.status, JSON.stringify(res.body, null, 2));
            }
            expect(res.status).toBe(403);
        });
    });

    describe('POST /api/v1/admin/grants/:id/approve', () => {
        it('should allow admin to approve a grant', async () => {
            const approvedGrant = { ...mockGrant, status: 'approved' };
            (prisma.grant.findUnique as jest.Mock).mockResolvedValue(mockGrant);
            (prisma.grant.update as jest.Mock).mockResolvedValue(approvedGrant);
            // Mock user retrieval for email
            (prisma.grant.update as jest.Mock).mockResolvedValue({
                ...approvedGrant,
                user: mockUser
            });

            const res = await request(app)
                .post(`/api/v1/admin/grants/${mockGrant.id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('approved');
            expect(prisma.grant.update).toHaveBeenCalled();
        });
    });
});
