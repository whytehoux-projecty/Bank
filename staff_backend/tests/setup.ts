import { PrismaClient } from '@prisma/client';

// Mock Prisma for testing
jest.mock('../src/config/database', () => ({
    prisma: {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        role: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        userRole: {
            create: jest.fn(),
        },
        application: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        applicationAudit: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
        payrollRecord: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
        },
        loan: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
        },
        loanInvoice: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            deleteMany: jest.fn(),
        },
        loanPayment: {
            create: jest.fn(),
        },
        contract: {
            findMany: jest.fn(),
        },
        employmentHistory: {
            findMany: jest.fn(),
        },
        cmsSetting: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            upsert: jest.fn(),
        },
        grant: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
        },
        leaveBalance: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        staffProfile: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
        },
        staffDocument: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        bankAccount: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
        },
        familyMember: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        deployment: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn({
            user: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
            role: { findUnique: jest.fn() },
            userRole: { create: jest.fn() },
        })),
    }
}));

// Mock Redis
jest.mock('../src/config/redis', () => ({
    redis: {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
        on: jest.fn(),
        ping: jest.fn().mockResolvedValue('PONG'),
    },
    CACHE_TTL: {
        SHORT: 300,
        MEDIUM: 1800,
        LONG: 86400,
    }
}));

// Mock Sentry
jest.mock('../src/config/sentry', () => ({
    initSentry: jest.fn(),
}));

// Mock Logger to avoid cluttering test output
jest.mock('../src/config/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn().mockImplementation((msg, meta) => console.error('LOGGED ERROR:', msg, meta)),
        warn: jest.fn(),
        debug: jest.fn(),
        http: jest.fn(),
    },
    morganStream: {
        write: jest.fn(),
    },
    logRequest: jest.fn(),
}));

// Mock Nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-email-id' }),
        verify: jest.fn().mockResolvedValue(true),
    }),
}));

// Set test environment variables
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
    // Setup code
});

afterAll(async () => {
    // Cleanup code
});

// Clear mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
});
