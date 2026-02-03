import { FastifyInstance } from 'fastify';
import { setupApp } from '../../server';
import { KycService } from '../../services/kycService';
import { ERROR_CODES } from '../../shared/index';

// Mock KycService
jest.mock('../../services/kycService', () => ({
    KycService: {
        getUserDocuments: jest.fn(),
        uploadDocument: jest.fn(),
        getDocumentById: jest.fn(),
        deleteDocument: jest.fn(),
        getKycStatus: jest.fn(),
        getKycNextSteps: jest.fn(),
        verifyDocument: jest.fn(),
    },
}));

// Mock Database
jest.mock('../../lib/database', () => ({
    __esModule: true,
    default: {
        connect: jest.fn(),
        disconnect: jest.fn(),
        prisma: {
            kycDocument: { findUnique: jest.fn() },
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
        req.user = { userId: 'user-123', email: 'test@example.com' };
        return Promise.resolve();
    }),
}));

// Mock other routes
jest.mock('../../routes/transactions', () => async () => { });
jest.mock('../../routes/auth', () => async () => { });
jest.mock('../../routes/users', () => async () => { });
jest.mock('../../routes/accounts', () => async () => { });
jest.mock('../../routes/wire-transfers', () => async () => { });
jest.mock('../../routes/system', () => async () => { });
jest.mock('../../routes/portal', () => async () => { });
jest.mock('../../routes/bills', () => async () => { });
jest.mock('../../routes/transfers', () => async () => { });
jest.mock('../../routes/admin/verifications', () => async () => { });

describe('KYC Routes', () => {
    let fastify: FastifyInstance;

    beforeAll(async () => {
        fastify = await setupApp();
    }, 30000);

    afterAll(async () => {
        await fastify.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. GET /:userId/documents
    describe('GET /:userId/documents', () => {
        it('should return user KYC documents', async () => {
            const mockDocuments = [
                { id: 'doc-1', documentType: 'PASSPORT', verificationStatus: 'PENDING' }
            ];
            (KycService.getUserDocuments as jest.Mock).mockResolvedValue(mockDocuments);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/kyc/user-123/documents',
            });

            expect(response.statusCode).toBe(200);
            const payload = JSON.parse(response.payload);
            expect(payload.success).toBe(true);
            expect(payload.data).toEqual(mockDocuments);
        });
    });

    // 2. POST /:userId/documents
    describe('POST /:userId/documents', () => {
        it('should upload KYC document successfully', async () => {
            const mockDocument = { id: 'doc-1', documentType: 'PASSPORT', verificationStatus: 'PENDING' };
            (KycService.uploadDocument as jest.Mock).mockResolvedValue(mockDocument);

            const response = await fastify.inject({
                method: 'POST',
                url: '/api/kyc/user-123/documents',
                payload: {
                    type: 'PASSPORT',
                    fileName: 'passport.pdf',
                    filePath: '/uploads/passport.pdf',
                    fileSize: 1024,
                    mimeType: 'application/pdf'
                }
            });

            expect(response.statusCode).toBe(201);
            const payload = JSON.parse(response.payload);
            expect(payload.success).toBe(true);
            expect(payload.data).toEqual(mockDocument);
        });
    });

    // 3. GET /:userId/documents/:documentId
    describe('GET /:userId/documents/:documentId', () => {
        it('should return specific KYC document', async () => {
            const mockDocument = { id: 'doc-1', documentType: 'PASSPORT' };
            (KycService.getDocumentById as jest.Mock).mockResolvedValue(mockDocument);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/kyc/user-123/documents/doc-1',
            });

            expect(response.statusCode).toBe(200);
            const payload = JSON.parse(response.payload);
            expect(payload.data).toEqual(mockDocument);
        });

        it('should return 500 if document not found', async () => {
            (KycService.getDocumentById as jest.Mock).mockRejectedValue(
                new Error(ERROR_CODES.RESOURCE_NOT_FOUND)
            );

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/kyc/user-123/documents/doc-999',
            });

            expect(response.statusCode).toBe(500);
        });
    });

    // 4. DELETE /:userId/documents/:documentId
    describe('DELETE /:userId/documents/:documentId', () => {
        it('should delete KYC document successfully', async () => {
            (KycService.deleteDocument as jest.Mock).mockResolvedValue({ success: true });

            const response = await fastify.inject({
                method: 'DELETE',
                url: '/api/kyc/user-123/documents/doc-1',
            });

            expect(response.statusCode).toBe(200);
            const payload = JSON.parse(response.payload);
            expect(payload.success).toBe(true);
        });
    });

    // 5. GET /:userId/status
    describe('GET /:userId/status', () => {
        it('should return KYC status', async () => {
            const mockStatus = {
                kycStatus: 'PENDING',
                documents: {
                    required: ['PASSPORT', 'PROOF_OF_ADDRESS'],
                    submitted: ['PASSPORT'],
                    verified: [],
                    missing: ['PROOF_OF_ADDRESS'],
                    pending: ['PASSPORT'],
                    rejected: []
                }
            };
            (KycService.getKycStatus as jest.Mock).mockResolvedValue(mockStatus);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/kyc/user-123/status',
            });

            expect(response.statusCode).toBe(200);
            const payload = JSON.parse(response.payload);
            expect(payload.data).toEqual(mockStatus);
        });
    });

    // 6. GET /:userId/next-steps
    describe('GET /:userId/next-steps', () => {
        it('should return KYC next steps', async () => {
            const mockNextSteps = {
                kycStatus: 'PENDING',
                nextSteps: ['Upload missing documents: PROOF_OF_ADDRESS'],
                canProceed: false
            };
            (KycService.getKycNextSteps as jest.Mock).mockResolvedValue(mockNextSteps);

            const response = await fastify.inject({
                method: 'GET',
                url: '/api/kyc/user-123/next-steps',
            });

            expect(response.statusCode).toBe(200);
            const payload = JSON.parse(response.payload);
            expect(payload.data).toEqual(mockNextSteps);
        });
    });
});
