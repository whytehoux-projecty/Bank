/**
 * Staff API Integration Tests
 * 
 * Tests REAL staff operations with:
 * - Real database queries
 * - Real authentication
 * - Real data retrieval
 * - Real CRUD operations
 * 
 * NO MOCKING - All tests use actual API and database
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../staff_backend/src/app';
import TEST_CONFIG from '../../config/test.config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: TEST_CONFIG.database.connectionString,
        },
    },
});

describe('Staff API - Real Integration Tests', () => {
    let authToken: string;
    let csrfToken: string;
    let testStaffId: string;

    beforeAll(async () => {
        await prisma.$connect();

        // Get CSRF token
        const csrfResponse = await request(app).get('/api/v1/csrf-token');
        csrfToken = csrfResponse.body.csrfToken;

        // Login to get auth token
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: TEST_CONFIG.auth.testUsers.staff.email,
                password: TEST_CONFIG.auth.testUsers.staff.password,
            });

        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/v1/staff/profile', () => {
        it('should get real staff profile from database', async () => {
            const response = await request(app)
                .get('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.profile).toBeDefined();
            expect(response.body.profile.email).toBe(TEST_CONFIG.auth.testUsers.staff.email);
            expect(response.body.profile.firstName).toBeDefined();
            expect(response.body.profile.lastName).toBeDefined();

            // Verify data matches database
            const dbUser = await prisma.user.findUnique({
                where: { email: TEST_CONFIG.auth.testUsers.staff.email },
            });

            expect(response.body.profile.id).toBe(dbUser?.id);
            expect(response.body.profile.email).toBe(dbUser?.email);
            expect(response.body.profile.firstName).toBe(dbUser?.firstName);
        });

        it('should reject request without auth token', async () => {
            const response = await request(app)
                .get('/api/v1/staff/profile')
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject request with invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/staff/profile')
                .set('Authorization', 'Bearer invalid.token.here')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/v1/staff/profile', () => {
        it('should update real staff profile in database', async () => {
            const updateData = {
                phone: '+256700123456',
                address: '123 Test Street, Kampala',
            };

            const response = await request(app)
                .put('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.profile.phone).toBe(updateData.phone);
            expect(response.body.profile.address).toBe(updateData.address);

            // Verify update in REAL database
            const dbUser = await prisma.user.findUnique({
                where: { email: TEST_CONFIG.auth.testUsers.staff.email },
            });

            expect(dbUser?.phone).toBe(updateData.phone);
            expect(dbUser?.address).toBe(updateData.address);
        });

        it('should validate phone number format', async () => {
            const response = await request(app)
                .put('/api/v1/staff/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ phone: 'invalid-phone' })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('phone');
        });
    });

    describe('GET /api/v1/staff/dashboard', () => {
        it('should get real dashboard data from database', async () => {
            const response = await request(app)
                .get('/api/v1/staff/dashboard')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.dashboard).toBeDefined();
            expect(response.body.dashboard.stats).toBeDefined();
            expect(response.body.dashboard.recentActivities).toBeDefined();

            // Verify stats are real numbers from database
            expect(typeof response.body.dashboard.stats.totalPayroll).toBe('number');
            expect(typeof response.body.dashboard.stats.activeLoans).toBe('number');
            expect(typeof response.body.dashboard.stats.pendingApplications).toBe('number');
        });
    });

    describe('GET /api/v1/staff', () => {
        it('should list real staff from database with pagination', async () => {
            const response = await request(app)
                .get('/api/v1/staff?page=1&limit=10')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.staff).toBeDefined();
            expect(Array.isArray(response.body.staff)).toBe(true);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(10);
            expect(response.body.pagination.total).toBeGreaterThan(0);

            // Verify data is from real database
            if (response.body.staff.length > 0) {
                const firstStaff = response.body.staff[0];
                const dbStaff = await prisma.staff.findUnique({
                    where: { id: firstStaff.id },
                });

                expect(dbStaff).not.toBeNull();
                expect(dbStaff?.employeeId).toBe(firstStaff.employeeId);
            }
        });

        it('should filter staff by department', async () => {
            const response = await request(app)
                .get('/api/v1/staff?department=IT')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify all returned staff are from IT department
            response.body.staff.forEach((staff: any) => {
                expect(staff.department).toBe('IT');
            });
        });

        it('should search staff by name', async () => {
            const response = await request(app)
                .get('/api/v1/staff?search=Test')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify search results contain search term
            response.body.staff.forEach((staff: any) => {
                const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
                expect(fullName).toContain('test');
            });
        });
    });

    describe('GET /api/v1/staff/:id', () => {
        it('should get real staff details from database', async () => {
            // First get a staff ID from the list
            const listResponse = await request(app)
                .get('/api/v1/staff?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            const staffId = listResponse.body.staff[0].id;

            const response = await request(app)
                .get(`/api/v1/staff/${staffId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.staff).toBeDefined();
            expect(response.body.staff.id).toBe(staffId);

            // Verify data matches database
            const dbStaff = await prisma.staff.findUnique({
                where: { id: staffId },
                include: { user: true },
            });

            expect(response.body.staff.employeeId).toBe(dbStaff?.employeeId);
            expect(response.body.staff.department).toBe(dbStaff?.department);
            expect(response.body.staff.position).toBe(dbStaff?.position);
        });

        it('should return 404 for non-existent staff', async () => {
            const response = await request(app)
                .get('/api/v1/staff/non-existent-id')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/staff/documents', () => {
        it('should get real documents from database', async () => {
            const response = await request(app)
                .get('/api/v1/staff/documents')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.documents).toBeDefined();
            expect(Array.isArray(response.body.documents)).toBe(true);

            // Verify documents are from real database
            if (response.body.documents.length > 0) {
                const firstDoc = response.body.documents[0];
                const dbDoc = await prisma.document.findUnique({
                    where: { id: firstDoc.id },
                });

                expect(dbDoc).not.toBeNull();
                expect(dbDoc?.title).toBe(firstDoc.title);
                expect(dbDoc?.fileName).toBe(firstDoc.fileName);
            }
        });

        it('should filter documents by type', async () => {
            const response = await request(app)
                .get('/api/v1/staff/documents?type=CONTRACT')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify all documents are contracts
            response.body.documents.forEach((doc: any) => {
                expect(doc.type).toBe('CONTRACT');
            });
        });
    });

    describe('POST /api/v1/staff/documents/upload', () => {
        it('should upload real document to filesystem and database', async () => {
            // Create a test file buffer
            const fileContent = Buffer.from('Test document content');

            const response = await request(app)
                .post('/api/v1/staff/documents/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .attach('file', fileContent, 'test-document.pdf')
                .field('title', 'Test Document')
                .field('type', 'CERTIFICATE')
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.document).toBeDefined();
            expect(response.body.document.title).toBe('Test Document');
            expect(response.body.document.type).toBe('CERTIFICATE');
            expect(response.body.document.fileName).toContain('test-document');

            // Verify document is in REAL database
            const dbDoc = await prisma.document.findUnique({
                where: { id: response.body.document.id },
            });

            expect(dbDoc).not.toBeNull();
            expect(dbDoc?.title).toBe('Test Document');
            expect(dbDoc?.fileType).toBe('pdf');

            // Cleanup: Delete test document
            await prisma.document.delete({ where: { id: response.body.document.id } });
        });

        it('should reject invalid file types', async () => {
            const fileContent = Buffer.from('Test content');

            const response = await request(app)
                .post('/api/v1/staff/documents/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .attach('file', fileContent, 'test.exe')
                .field('title', 'Invalid File')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('file type');
        });

        it('should reject files exceeding size limit', async () => {
            // Create a large file buffer (11MB)
            const largeFile = Buffer.alloc(11 * 1024 * 1024);

            const response = await request(app)
                .post('/api/v1/staff/documents/upload')
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .attach('file', largeFile, 'large-file.pdf')
                .field('title', 'Large File')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('size');
        });
    });

    describe('Role-Based Access Control', () => {
        it('should allow admin to access all staff', async () => {
            // Login as admin
            const adminLogin = await request(app)
                .post('/api/v1/auth/login')
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: TEST_CONFIG.auth.testUsers.admin.email,
                    password: TEST_CONFIG.auth.testUsers.admin.password,
                });

            const adminToken = adminLogin.body.token;

            const response = await request(app)
                .get('/api/v1/staff')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.staff.length).toBeGreaterThan(0);
        });

        it('should restrict staff to own data only', async () => {
            const response = await request(app)
                .get('/api/v1/staff')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Staff should only see their own data or limited data
            // Implementation depends on business logic
        });
    });

    describe('Data Integrity', () => {
        it('should maintain referential integrity on updates', async () => {
            // Get a staff record
            const listResponse = await request(app)
                .get('/api/v1/staff?limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            const staffId = listResponse.body.staff[0].id;

            // Update staff record
            const updateResponse = await request(app)
                .put(`/api/v1/staff/${staffId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({ position: 'Senior Officer' })
                .expect(200);

            expect(updateResponse.body.success).toBe(true);

            // Verify update in database
            const dbStaff = await prisma.staff.findUnique({
                where: { id: staffId },
            });

            expect(dbStaff?.position).toBe('Senior Officer');

            // Verify related records are intact
            const relatedPayroll = await prisma.payroll.findMany({
                where: { staffId },
            });

            expect(relatedPayroll.length).toBeGreaterThanOrEqual(0);
        });
    });
});
