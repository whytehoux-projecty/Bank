import { ApplicationService } from '../../src/modules/applications/application.service';
import { prisma } from '../../src/config/database';
import { CreateApplicationDTO } from '../../src/modules/applications/application.types';

// Mock Prisma
jest.mock('../../src/config/database', () => ({
    prisma: {
        application: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        applicationAudit: {
            create: jest.fn(),
        },
    },
}));

describe('ApplicationService', () => {
    let applicationService: ApplicationService;

    beforeEach(() => {
        applicationService = new ApplicationService();
        jest.clearAllMocks();
    });

    describe('createApplication', () => {
        const userId = 'user-123';

        it('should auto-approve leave request less than 3 days', async () => {
            const data: CreateApplicationDTO = {
                type: 'leave',
                data: {
                    startDate: '2026-02-01',
                    endDate: '2026-02-02', // 2 days inclusive (01, 02)
                    reason: 'Sick',
                },
            };

            (prisma.application.create as jest.Mock).mockResolvedValue({
                id: 'app-1',
                user_id: userId,
                type: data.type,
                status: 'approved',
                createdAt: new Date(),
            });

            await applicationService.createApplication(userId, data);

            expect(prisma.application.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    status: 'approved'
                })
            }));
            // Should create audit log
            expect(prisma.applicationAudit.create).toHaveBeenCalled();
        });

        it('should NOT auto-approve leave request >= 3 days', async () => {
            const data: CreateApplicationDTO = {
                type: 'leave',
                data: {
                    startDate: '2026-02-01',
                    endDate: '2026-02-03', // 3 days inclusive (01, 02, 03)
                    reason: 'Vacation',
                },
            };

            (prisma.application.create as jest.Mock).mockResolvedValue({
                id: 'app-2',
                user_id: userId,
                type: data.type,
                status: 'pending',
                createdAt: new Date(),
            });

            await applicationService.createApplication(userId, data);

            expect(prisma.application.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    status: 'pending'
                })
            }));
            // Should NOT create audit log for pending
            expect(prisma.applicationAudit.create).not.toHaveBeenCalled();
        });

        it('should NOT auto-approve other request types', async () => {
            const data: CreateApplicationDTO = {
                type: 'loan',
                data: {
                    amount: 100,
                    reason: 'Small Loan',
                },
            };

            (prisma.application.create as jest.Mock).mockResolvedValue({
                id: 'app-3',
                user_id: userId,
                type: data.type,
                status: 'pending',
                createdAt: new Date(),
            });

            await applicationService.createApplication(userId, data);

            expect(prisma.application.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    status: 'pending'
                })
            }));
            expect(prisma.applicationAudit.create).not.toHaveBeenCalled();
        });
    });
});
