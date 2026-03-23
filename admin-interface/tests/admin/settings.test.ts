
import Fastify, { FastifyInstance } from "fastify";
import settingsRoutes from "../../src/routes/admin/settings";
import { prisma } from "../../src/lib/prisma";
import { setupTestData } from "../setup";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fastifyCookie from "@fastify/cookie";

describe("Admin Settings Routes", () => {
    let app: FastifyInstance;
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
        app = Fastify();
        app.register(fastifyCookie);
        await app.register(settingsRoutes, { prefix: '/api/admin/settings' });

        await setupTestData();

        // Create Admin
        const passwordHash = await bcrypt.hash("password123", 10);
        const admin = await prisma.adminUser.create({
            data: {
                email: "admin@settings.com",
                firstName: "Admin",
                lastName: "User",
                password: passwordHash,
                role: "ADMIN",
                status: "ACTIVE"
            }
        });
        adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET!);

        // Create User (non-admin) to test role guard? 
        // But authenticateToken checks admin_users table. 
        // So a regular user token from "users" table wont work with authenticateToken middleware which queries admin_users.
        // But if I create an AdminUser with role "MODERATOR"? 
        // define role MODERATOR? Schema default is ADMIN.
        // Schema allows Any string. 
        // requireAdminRole checks for 'ADMIN' or 'SUPER_ADMIN'.

        const moderator = await prisma.adminUser.create({
            data: {
                email: "mod@settings.com",
                firstName: "Mod",
                lastName: "User",
                password: passwordHash,
                role: "MODERATOR",
                status: "ACTIVE"
            }
        });
        userToken = jwt.sign({ id: moderator.id, role: moderator.role }, process.env.JWT_SECRET!);
    });

    afterEach(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it("GET /api/admin/settings should return default settings", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/admin/settings',
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.verificationEnabled).toBe(false); // Default logic: configs.find(...)?.value === 'true'
        expect(body.data.globalThreshold).toBe(10000);
    });

    it("POST /api/admin/settings should update settings", async () => {
        const payload = {
            verificationEnabled: true,
            globalThreshold: 5000,
            documentTypes: ["PASSPORT", "DRIVERS_LICENSE"],
            categoryThresholds: { "HIGH_RISK": 1000 },
            notificationEmail: "alert@admin.com",
            notificationSms: "+1234567890"
        };

        const response = await app.inject({
            method: 'POST',
            url: '/api/admin/settings',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).success).toBe(true);

        // Verify DB
        const config = await prisma.systemConfig.findUnique({ where: { key: 'payment_verification_enabled' } });
        expect(config?.value).toBe("true");

        // Verify GET
        const getResponse = await app.inject({
            method: 'GET',
            url: '/api/admin/settings',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const body = JSON.parse(getResponse.body);
        expect(body.data.verificationEnabled).toBe(true);
        expect(body.data.globalThreshold).toBe(5000);
    });

    it("POST /api/admin/settings should validate input", async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/admin/settings',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: {
                verificationEnabled: "yes", // Invalid type
                globalThreshold: -100 // Invalid
            }
        });

        expect(response.statusCode).toBe(400);
    });

    it("GET /api/admin/settings/history should return audit logs", async () => {
        // Update first
        const payload = {
            verificationEnabled: true,
            globalThreshold: 5000,
            documentTypes: ["PASSPORT"],
        };
        await app.inject({
            method: 'POST',
            url: '/api/admin/settings',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload
        });

        const response = await app.inject({
            method: 'GET',
            url: '/api/admin/settings/history',
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        // On first update in empty DB, all 6 settings are upserted, so 6 logs are created.
        expect(body.data.length).toBeGreaterThanOrEqual(3);
        expect(body.data[0].action).toBe('UPDATE_SYSTEM_CONFIG');
    });

    it("should reject non-admin users", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/admin/settings',
            headers: { Authorization: `Bearer ${userToken}` }
        });
        expect(response.statusCode).toBe(403);
    });
});
