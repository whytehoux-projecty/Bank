import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing';

const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, role, staffId: 'staff-123' }, TEST_SECRET, { expiresIn: '1h' });
};

const mockUser = {
    id: 'user-123',
    staff_id: 'STAFF-001',
    email: 'staff@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'staff',
    status: 'active',
    avatar_url: 'http://example.com/avatar.jpg',
    created_at: new Date(),
    roles: [{ role: { name: 'staff' } }],
    employment_history: [{
        department: { name: 'IT' },
        position_title: 'Developer'
    }],
    staff_profile: {
        personal_phone: '1234567890',
        work_phone: '0987654321',
        permanent_address: '123 Main St'
    },
    bank_accounts: [],
    deployments: [],
    leave_balances: [],
    family_members: []
};

const mockBankAccount = {
    id: 'bank-001',
    user_id: mockUser.id,
    bank_name: 'Test Bank',
    account_holder_name: 'John Doe',
    account_number: '1234567890',
    currency: 'USD',
    is_primary: true
};

const mockFamilyMember = {
    id: 'family-001',
    user_id: mockUser.id,
    first_name: 'Jane',
    last_name: 'Doe',
    relationship: 'spouse'
};

const mockDocument = {
    id: 'doc-001',
    user_id: mockUser.id,
    document_type: 'passport',
    document_name: 'My Passport',
    file_url: '/uploads/passport.pdf'
};

describe('Staff API Endpoints', () => {
    let userToken: string;

    beforeAll(() => {
        userToken = generateToken(mockUser.id, 'staff');
    });

    describe('GET /api/v1/staff/profile', () => {
        it('should return user profile', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app)
                .get('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(mockUser.email);
            expect(res.body.data.staffProfile).toBeDefined();
        });

        it('should return 404 if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/v1/staff/profile', () => {
        it('should update user profile', async () => {
            const updateData = {
                firstName: 'Johnny',
                personalPhone: '5555555555'
            };

            const updatedUser = { ...mockUser, first_name: updateData.firstName };
            const updatedProfile = { ...mockUser.staff_profile, personal_phone: updateData.personalPhone };

            // Mock $transaction result
            (prisma.$transaction as jest.Mock).mockResolvedValue([updatedUser, updatedProfile]);

            const res = await request(app)
                .put('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.first_name).toBe(updateData.firstName);
            expect(res.body.data.staffProfile.personal_phone).toBe(updateData.personalPhone);
        });

        it('should validate input data', async () => {
            const res = await request(app)
                .put('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    email: 'invalid-email' // Invalid email
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/staff/bank-accounts', () => {
        it('should return bank accounts', async () => {
            (prisma.bankAccount.findMany as jest.Mock).mockResolvedValue([mockBankAccount]);

            const res = await request(app)
                .get('/api/v1/staff/bank-accounts')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].id).toBe(mockBankAccount.id);
        });
    });

    describe('POST /api/v1/staff/bank-accounts', () => {
        it('should create a new bank account', async () => {
            const newAccount = {
                bankName: 'New Bank',
                accountName: 'John Doe',
                accountNumber: '999999999',
                isPrimary: true
            };

            (prisma.bankAccount.create as jest.Mock).mockResolvedValue({
                ...mockBankAccount,
                bank_name: newAccount.bankName,
                account_number: newAccount.accountNumber
            });

            const res = await request(app)
                .post('/api/v1/staff/bank-accounts')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newAccount);

            expect(res.status).toBe(200);
            expect(res.body.data.bank_name).toBe(newAccount.bankName);
        });

        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/api/v1/staff/bank-accounts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    bankName: 'Bank Only'
                    // Missing account details
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/staff/family-members', () => {
        it('should return family members', async () => {
            (prisma.familyMember.findMany as jest.Mock).mockResolvedValue([mockFamilyMember]);

            const res = await request(app)
                .get('/api/v1/staff/family-members')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe('POST /api/v1/staff/family-members', () => {
        it('should add a family member', async () => {
            const newMember = {
                firstName: 'Baby',
                lastName: 'Doe',
                relationship: 'child'
            };

            (prisma.familyMember.create as jest.Mock).mockResolvedValue({
                ...mockFamilyMember,
                first_name: newMember.firstName,
                relationship: newMember.relationship
            });

            const res = await request(app)
                .post('/api/v1/staff/family-members')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newMember);

            expect(res.status).toBe(200);
            expect(prisma.familyMember.create).toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/staff/documents', () => {
        it('should return documents', async () => {
            (prisma.staffDocument.findMany as jest.Mock).mockResolvedValue([mockDocument]);

            const res = await request(app)
                .get('/api/v1/staff/documents')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe('GET /api/v1/staff/notifications', () => {
        it('should aggregate notifications correctly', async () => {
            // Mock empty arrays for most, but some data for applications
            (prisma.application.findMany as jest.Mock).mockResolvedValue([
                { id: 'app-1', type: 'leave', status: 'pending', created_at: new Date(), user_id: mockUser.id }
            ]);
            (prisma.applicationAudit.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.payrollRecord.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.loan.findMany as jest.Mock).mockResolvedValue([]);

            const res = await request(app)
                .get('/api/v1/staff/notifications')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].category).toBe('applications');
        });
    });
});
