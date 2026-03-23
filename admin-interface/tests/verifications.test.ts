
import Fastify, { FastifyInstance } from "fastify";
import verificationApiRoutes from "../src/routes/verifications";
import { prisma } from "../src/lib/prisma";
import { setupTestData } from "./setup";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fastifyCookie from "@fastify/cookie";
import { NotificationService } from "../src/services/NotificationService";

// Mock NotificationService
jest.mock("../src/services/NotificationService");

describe("Verification Routes", () => {
    let app: FastifyInstance;
    let adminToken: string;
    let transactionId: string;
    let verificationId: string;

    beforeEach(async () => {
        app = Fastify();
        app.decorate("authenticate", async (_request: any, _reply: any) => {
            // Mock auth middleware for simplicity or integration?
            // Actually verificationApiRoutes uses imported authenticateToken which verifies JWT.
            // But we can't easily mock imported middleware if it's used inside the route file during registration?
            // No, it's imported at top level.  Integration testing with real jwt is better.
        });

        await app.register(fastifyCookie);
        await app.register(verificationApiRoutes);

        await setupTestData();

        // Create Admin
        const passwordHash = await bcrypt.hash("password123", 10);
        const admin = await prisma.adminUser.create({
            data: {
                email: "admin@test.com",
                firstName: "Admin",
                lastName: "User",
                password: passwordHash,
                role: "ADMIN",
                status: "ACTIVE"
            }
        });
        adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET!);

        // Create User, Account, Transaction
        const user = await prisma.user.create({
            data: {
                email: "user@test.com",
                password: "password",
                firstName: "User",
                lastName: "Test",
                status: "ACTIVE",
                dateOfBirth: new Date("1990-01-01"),
            }
        });

        const account = await prisma.account.create({
            data: {
                userId: user.id,
                accountType: "CHECKING",
                currency: "USD",
                balance: 1000,
                accountNumber: "1234567890"
            }
        });

        const transaction = await prisma.transaction.create({
            data: {
                accountId: account.id,
                type: "TRANSFER",
                amount: -100,
                currency: "USD",
                status: "PENDING",
                reference: "REF123",
                category: "PAYMENT",
                description: "Test Payment",
                metadata: JSON.stringify({ invoiceNumber: "INV-001" })
            }
        });
        transactionId = transaction.id;

        const verification = await prisma.paymentVerification.create({
            data: {
                transactionId: transaction.id,
                status: "PENDING",
                documentPath: "/uploads/proof.pdf",
                documentType: "PROOF_OF_PAYMENT"
            }
        });
        verificationId = verification.id;
    });

    afterEach(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it("GET /verifications should return pending verifications", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/verifications',
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
        expect(body.data[0].id).toBe(verificationId);
    });

    it("GET /verifications should require auth", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/verifications'
        });
        expect(response.statusCode).toBe(401);
    });

    it("POST /verifications/:id/approve should approve verification", async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/verifications/${verificationId}/approve`,
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: { notes: "Looks good" }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).success).toBe(true);

        const updated = await prisma.paymentVerification.findUnique({ where: { id: verificationId } });
        expect(updated?.status).toBe('APPROVED');
        expect(updated?.adminNotes).toBe('Looks good');

        const txn = await prisma.transaction.findUnique({ where: { id: transactionId } });
        expect(txn?.status).toBe('COMPLETED');

        expect(NotificationService.notifyCustomer).toHaveBeenCalledWith("user@test.com", "APPROVED", expect.anything());
        expect(NotificationService.notifyStaffPortal).toHaveBeenCalledWith(transactionId, "COMPLETED", "REF123", 100, "INV-001");
    });

    it("POST /verifications/:id/reject should reject verification", async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/verifications/${verificationId}/reject`,
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: { notes: "Bad proof" }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).success).toBe(true);

        const updated = await prisma.paymentVerification.findUnique({ where: { id: verificationId } });
        expect(updated?.status).toBe('REJECTED');

        const txn = await prisma.transaction.findUnique({ where: { id: transactionId } });
        expect(txn?.status).toBe('FAILED');

        // Check refund
        const account = await prisma.account.findFirst();
        // 1000 - 100 (initial) + 100 (refund) = 1000. 
        // Wait, did I deduct balance initially?
        // prisma.transaction.create doesn't automatically deduct balance unless logic exists.
        // I created account with 1000 balance manualy.
        // My test setup didn't deduct balance.
        // But reject logic does: data: { balance: { increment: refundAmount } }
        // So balance should become 1100.
        // amount was -100. refundAmount = 100.
        expect(Number(account?.balance)).toBe(1100);

        expect(NotificationService.notifyCustomer).toHaveBeenCalledWith("user@test.com", "REJECTED", expect.anything());
    });
});
