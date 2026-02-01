import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing';

const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role, staffId: 'staff-admin' }, TEST_SECRET, { expiresIn: '1h' });
};

const mockAdminUser = {
    id: 'admin-123',
    staff_id: 'ADMIN-001',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    status: 'active',
    avatar_url: 'http://example.com/admin.jpg',
    created_at: new Date(),
    roles: [{ role: { name: 'admin' } }],
    employment_history: [],
    staff_profile: {},
    bank_accounts: [],
    deployments: [],
    leave_balances: [],
    family_members: []
};

const mockApplication = {
    id: 'app-001',
    user_id: 'user-456',
    type: 'leave',
    data: { reason: 'Vacation' },
    status: 'pending',
    created_at: new Date(),
    user: {
        first_name: 'Staff',
        last_name: 'Member',
        staff_id: 'STAFF-456'
    }
};

describe('Admin API Endpoints', () => {
    let adminToken: string;
    let staffToken: string;

    beforeAll(() => {
        adminToken = generateToken(mockAdminUser.id, 'admin');
        staffToken = generateToken('staff-456', 'staff');
    });

    describe('GET /api/v1/admin/users', () => {
        it('should return all users for admin', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockAdminUser]);

            const res = await request(app)
                .get('/api/v1/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
        });

        it('should deny access for non-admin', async () => {
            const res = await request(app)
                .get('/api/v1/admin/users')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/v1/admin/applications', () => {
        it('should return all applications', async () => {
            (prisma.application.findMany as jest.Mock).mockResolvedValue([mockApplication]);

            const res = await request(app)
                .get('/api/v1/admin/applications')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe('PATCH /api/v1/admin/applications/:id/decision', () => {
        it('should approve an application', async () => {
            const applicationId = '550e8400-e29b-41d4-a716-446655440000';
            const decisionData = {
                decision: 'approved',
                comment: 'Looks good'
            };

            // Mock finding the application
            (prisma.application.findUnique as jest.Mock).mockResolvedValue(mockApplication);

            // Mock updating the application
            (prisma.application.update as jest.Mock).mockResolvedValue({
                ...mockApplication,
                status: 'approved'
            });

            // Mock creating audit log
            (prisma.applicationAudit.create as jest.Mock).mockResolvedValue({ id: 'audit-1' });

            const res = await request(app)
                .patch(`/api/v1/admin/applications/${applicationId}/decision`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(decisionData);

            expect(res.status).toBe(200);
            expect(prisma.application.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: applicationId },
                data: expect.objectContaining({ status: 'approved' })
            }));
            expect(prisma.applicationAudit.create).toHaveBeenCalled();
        });

        it('should return 404 for non-existent application', async () => {
            (prisma.application.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .patch('/api/v1/admin/applications/00000000-0000-0000-0000-000000000000/decision')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ decision: 'approved' });

            expect(res.status).toBe(404);
        });
    });
});
