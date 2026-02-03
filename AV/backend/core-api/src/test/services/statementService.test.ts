import { StatementService } from '../../services/statement.service';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Mock dependencies
const mPrismaClient: any = {
    account: {
        findUnique: jest.fn(),
    },
    statement: {
        create: jest.fn(),
    },
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

jest.mock('pdfkit', () => {
    return jest.fn().mockImplementation(() => ({
        pipe: jest.fn(),
        fontSize: jest.fn().mockReturnThis(),
        font: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
        moveTo: jest.fn().mockReturnThis(),
        lineTo: jest.fn().mockReturnThis(),
        strokeColor: jest.fn().mockReturnThis(),
        stroke: jest.fn().mockReturnThis(),
        fillColor: jest.fn().mockReturnThis(),
        addPage: jest.fn().mockReturnThis(),
        end: jest.fn(),
        y: 100,
    }));
});

jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    createWriteStream: jest.fn(),
    statSync: jest.fn().mockReturnValue({ size: 1024 }),
}));

jest.mock('path', () => ({
    join: jest.fn((...args) => args.join('/')),
}));

describe('StatementService', () => {
    let statementService: StatementService;

    beforeEach(() => {
        jest.clearAllMocks();
        statementService = new StatementService();
    });

    describe('generateStatement', () => {
        const mockGenerateParams = {
            accountId: 'acc-1',
            periodStart: new Date('2023-01-01'),
            periodEnd: new Date('2023-01-31'),
        };

        it('should throw error if account not found', async () => {
            mPrismaClient.account.findUnique.mockResolvedValue(null);
            await expect(statementService.generateStatement('acc-1', mockGenerateParams.periodStart, mockGenerateParams.periodEnd))
                .rejects.toThrow('Account not found');
        });

        it('should generate statement successfully', async () => {
            mPrismaClient.account.findUnique.mockResolvedValue({
                id: 'acc-1',
                accountNumber: '1234567890',
                accountType: 'CHECKING',
                balance: 1000,
                user: { firstName: 'John', lastName: 'Doe' },
                transactions: [
                    {
                        type: 'DEPOSIT',
                        amount: 100,
                        createdAt: new Date(),
                        description: 'Test Deposit'
                    }
                ],
            });

            const mockStream = {
                on: jest.fn((event, cb) => {
                    if (event === 'finish') cb();
                }),
            };
            (fs.createWriteStream as jest.Mock).mockReturnValue(mockStream);
            mPrismaClient.statement.create.mockResolvedValue({ id: 'stmt-1' });

            const result = await statementService.generateStatement(
                mockGenerateParams.accountId,
                mockGenerateParams.periodStart,
                mockGenerateParams.periodEnd
            );

            expect(result.id).toBe('stmt-1');
            expect(fs.createWriteStream).toHaveBeenCalled();
            expect(PDFDocument).toHaveBeenCalled();
            expect(mPrismaClient.statement.create).toHaveBeenCalled();
        });

        it('should create directory if not exists', async () => {
            mPrismaClient.account.findUnique.mockResolvedValue({
                id: 'acc-1',
                accountNumber: '123',
                balance: 1000,
                user: { firstName: 'J', lastName: 'D' },
                transactions: []
            });
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            const mockStream = {
                on: jest.fn((event, cb) => { if (event === 'finish') cb(); }),
            };
            (fs.createWriteStream as jest.Mock).mockReturnValue(mockStream);
            mPrismaClient.statement.create.mockResolvedValue({ id: 'stmt-1' });

            await statementService.generateStatement('acc-1', new Date(), new Date());
            expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('statements'), { recursive: true });
        });
    });
});
