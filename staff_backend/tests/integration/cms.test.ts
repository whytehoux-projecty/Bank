import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing';

const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role, staffId: 'staff-123' }, TEST_SECRET, { expiresIn: '1h' });
};

const mockSetting = {
    id: 1,
    setting_key: 'site_name',
    setting_value: 'UHI Staff Portal',
    setting_type: 'text',
    category: 'general',
    is_public: true
};

const mockAdminUser = {
    id: 'admin-123',
    role: 'admin'
};

describe('CMS API Endpoints', () => {
    let adminToken: string;

    beforeAll(() => {
        adminToken = generateToken(mockAdminUser.id, 'admin');
    });

    describe('GET /api/v1/cms/settings', () => {
        it('should return public settings', async () => {
            (prisma.cmsSetting.findMany as jest.Mock).mockResolvedValue([mockSetting]);

            const res = await request(app)
                .get('/api/v1/cms/settings');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.site_name).toBe('UHI Staff Portal');
        });
    });

    describe('GET /api/v1/cms/admin/settings', () => {
        it('should return all settings for admin', async () => {
            (prisma.cmsSetting.findMany as jest.Mock).mockResolvedValue([mockSetting]);
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser); // For auth middleware identifying user

            const res = await request(app)
                .get('/api/v1/cms/admin/settings')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
        });
    });
});
