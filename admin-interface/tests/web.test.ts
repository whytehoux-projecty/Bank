
import Fastify, { FastifyInstance } from "fastify";
import webRoutes from "../src/routes/web";
import { AdminController } from "../src/controllers/AdminController";
import fastifyCookie from "@fastify/cookie";
import { setupTestData } from "./setup";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock AdminController
jest.mock("../src/controllers/AdminController");

describe("Web Routes", () => {
    let app: FastifyInstance;
    let adminToken: string;

    beforeEach(async () => {
        app = Fastify();
        app.register(fastifyCookie);

        // Mock view engine
        app.decorateReply('view', function (template: string, _data: any) {
            return this.type('text/html').send(`Rendered ${template}`);
        });

        await app.register(webRoutes);

        // Setup Auth
        await setupTestData();
        const passwordHash = await bcrypt.hash("password123", 10);
        const admin = await prisma.adminUser.create({
            data: {
                email: "admin@webtest.com",
                firstName: "Admin",
                lastName: "User",
                password: passwordHash,
                role: "ADMIN",
                status: "ACTIVE"
            }
        });
        adminToken = jwt.sign({ userId: admin.id, role: admin.role }, process.env.JWT_SECRET!);
    });

    afterEach(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    it("GET / should redirect to dashboard", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/'
        });
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/dashboard');
    });

    it("GET /login should render login page", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/login'
        });
        expect(response.statusCode).toBe(200);
        expect(response.payload).toContain("Rendered login");
    });

    it("GET /dashboard should render dashboard", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/dashboard',
            cookies: { admin_token: adminToken }
        });
        expect(response.statusCode).toBe(200);
        expect(response.payload).toContain("Rendered dashboard");
        expect(AdminController.getDashboardStats).toHaveBeenCalled();
    });

    it("GET /users should render users page", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/users',
            cookies: { admin_token: adminToken }
        });
        expect(response.statusCode).toBe(200);
        expect(response.payload).toContain("Rendered users");
    });

    // Test other pages similarly...
    const pages = [
        'accounts',
        'transactions',
        'kyc',
        'wire-transfers',
        'audit-logs',
        'settings',
        'portal-status',
        'profile',
        'cards',
        'bills'
    ];

    pages.forEach(page => {
        it(`GET /${page} should render ${page} page`, async () => {
            const response = await app.inject({
                method: 'GET',
                url: `/${page}`,
                cookies: { admin_token: adminToken }
            });
            expect(response.statusCode).toBe(200);
            expect(response.payload).toContain(`Rendered ${page}`);
        });
    });

    it("GET /dashboard should redirect if not auth", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/dashboard'
        });
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/login');
    });
});
