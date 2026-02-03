import { KycService } from '../../services/kycService';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

// Mock dependencies
const mPrismaClient = {
    kycDocument: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    auditLog: {
        create: jest.fn(),
    },
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock('fs/promises');

jest.mock('../../shared/index', () => ({
    ERROR_CODES: {
        RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
        USER_NOT_FOUND: 'USER_NOT_FOUND',
    },
    KYC_CONFIG: {
        REQUIRED_DOCUMENTS: ['PASSPORT', 'ID_CARD'],
        PROOF_OF_ADDRESS_DOCUMENTS: ['UTILITY_BILL'],
        MAX_UPLOAD_SIZE: 1024 * 1024 * 5, // 5MB
    }
}));

describe('KycService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadDocument', () => {
        const mockDocData = {
            documentType: 'PASSPORT',
            fileName: 'passport.jpg',
            filePath: '/tmp/passport.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            fileBuffer: Buffer.from('test'),
        };

        it('should throw error for invalid document type', async () => {
            await expect(KycService.uploadDocument('user-1', {
                ...mockDocData,
                documentType: 'INVALID'
            })).rejects.toThrow('Invalid document type');
        });

        it('should throw error if file too large', async () => {
            await expect(KycService.uploadDocument('user-1', {
                ...mockDocData,
                fileSize: 1024 * 1024 * 10 // 10MB
            })).rejects.toThrow('File size exceeds');
        });

        it('should throw error if duplicate pending document', async () => {
            mPrismaClient.kycDocument.findFirst.mockResolvedValue({ id: 'doc-1' });
            await expect(KycService.uploadDocument('user-1', mockDocData))
                .rejects.toThrow('Document of this type already exists');
        });

        it('should upload document successfully', async () => {
            mPrismaClient.kycDocument.findFirst.mockResolvedValue(null);
            mPrismaClient.kycDocument.create.mockResolvedValue({ id: 'doc-new' });

            const result = await KycService.uploadDocument('user-1', mockDocData);

            expect(result).toBeDefined();
            expect(mPrismaClient.kycDocument.create).toHaveBeenCalled();
            expect(mPrismaClient.auditLog.create).toHaveBeenCalled();
        });
    });

    describe('getUserDocuments', () => {
        it('should return documents', async () => {
            mPrismaClient.kycDocument.findMany.mockResolvedValue([{ id: 'doc-1' }]);
            const result = await KycService.getUserDocuments('user-1');
            expect(result).toHaveLength(1);
        });
    });

    describe('deleteDocument', () => {
        it('should throw error if document verified', async () => {
            mPrismaClient.kycDocument.findFirst.mockResolvedValue({
                id: 'doc-1',
                verificationStatus: 'VERIFIED'
            });
            await expect(KycService.deleteDocument('doc-1', 'user-1'))
                .rejects.toThrow('Cannot delete verified document');
        });

        it('should delete document successfully', async () => {
            mPrismaClient.kycDocument.findFirst.mockResolvedValue({
                id: 'doc-1',
                verificationStatus: 'PENDING',
                filePath: '/tmp/file'
            });

            await KycService.deleteDocument('doc-1', 'user-1');

            expect(fs.unlink).toHaveBeenCalledWith('/tmp/file');
            expect(mPrismaClient.kycDocument.delete).toHaveBeenCalled();
        });
    });

    describe('getKycStatus', () => {
        it('should return status details', async () => {
            mPrismaClient.user.findUnique.mockResolvedValue({
                kycStatus: 'PENDING',
                kycNotes: null,
                tier: 'BASIC'
            });
            mPrismaClient.kycDocument.findMany.mockResolvedValue([
                { documentType: 'PASSPORT', verificationStatus: 'VERIFIED' }
            ]);

            const result = await KycService.getKycStatus('user-1');

            expect(result.kycStatus).toBe('PENDING');
            expect(result.documents.verified).toContain('PASSPORT');
            expect(result.documents.missing).toContain('ID_CARD'); // From config mock
        });
    });

    describe('verifyDocument', () => {
        it('should verify document and upgrade user if all docs verified', async () => {
            mPrismaClient.kycDocument.findUnique.mockResolvedValue({
                id: 'doc-1',
                userId: 'user-1',
                documentType: 'ID_CARD'
            });
            mPrismaClient.kycDocument.update.mockResolvedValue({ verificationStatus: 'VERIFIED' });

            // Mock finding all docs to check if user verified
            mPrismaClient.kycDocument.findMany.mockResolvedValue([
                { documentType: 'PASSPORT', verificationStatus: 'VERIFIED' },
                { documentType: 'ID_CARD', verificationStatus: 'VERIFIED' }
            ]);

            await KycService.verifyDocument('doc-1', 'admin-1', { status: 'VERIFIED' });

            expect(mPrismaClient.kycDocument.update).toHaveBeenCalled();
            expect(mPrismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'user-1' },
                data: expect.objectContaining({ kycStatus: 'VERIFIED', tier: 'PREMIUM' })
            }));
        });
    });
});
