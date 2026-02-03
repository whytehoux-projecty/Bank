
import Fastify, { FastifyInstance } from "fastify";
import fastifyCookie from "@fastify/cookie";
import { commonSchemas, validateRequest } from "../src/middleware/validation";
import { performanceMonitoring, logPerformanceMetrics, getSystemHealth } from "../src/middleware/performance";
import { authenticateWeb, redirectIfAuthenticated } from "../src/middleware/webAuth";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "../src/lib/prisma";
import { setupTestData } from "./setup";
import bcrypt from "bcrypt";

describe("Middleware Tests", () => {
    let app: FastifyInstance;
    let testUser: any;

    beforeEach(() => {
        app = Fastify();
        app.register(fastifyCookie);
    });

    afterEach(() => {
        app.close();
    });

    describe("Validation Middleware", () => {
        it("should validate and transform body", async () => {
            const schema = {
                body: z.object({
                    name: z.string(),
                    age: z.string().transform(Number)
                })
            };

            app.post('/', { preHandler: validateRequest(schema) }, async (req) => {
                return (req.body as any).age;
            });

            const response = await app.inject({
                method: 'POST',
                url: '/',
                payload: { name: 'Test', age: '25' }
            });

            expect(response.statusCode).toBe(200);
            expect(response.json()).toBe(25);
        });

        it("should return 400 on validation error", async () => {
            const schema = {
                body: z.object({
                    name: z.string(),
                })
            };

            app.post('/', { preHandler: validateRequest(schema) }, async () => "ok");

            const response = await app.inject({
                method: 'POST',
                url: '/',
                payload: { name: 123 }
            });

            expect(response.statusCode).toBe(400);
        });

        it("should check common schemas", () => {
            expect(commonSchemas.id.params).toBeDefined();
            expect(commonSchemas.pagination.query).toBeDefined();
        });
    });

    describe("Performance Middleware", () => {
        it("should metrics headers", async () => {
            app.addHook('onRequest', performanceMonitoring());
            app.addHook('onSend', async (req, reply, payload) => {
                logPerformanceMetrics(req, reply);
                return payload;
            });
            app.get('/', async () => "ok");

            const response = await app.inject({
                method: 'GET',
                url: '/'
            });

            expect(response.headers['x-request-id']).toBeDefined();
            expect(response.headers['x-response-time']).toBeDefined();
        });

        it("should get system health", async () => {
            const health = await getSystemHealth();
            expect(health.status).toBe("healthy");
            expect(health.memory).toBeDefined();
        });
    });

    describe("Web Auth Middleware", () => {
        beforeEach(async () => {
            await setupTestData();
            const passwordHash = await bcrypt.hash("TestPassword123!", 12);
            testUser = await prisma.adminUser.create({
                data: {
                    email: "test@admin.com",
                    firstName: "Test",
                    lastName: "Admin",
                    password: passwordHash,
                    role: "ADMIN",
                    status: "ACTIVE",
                },
            });
        });

        it("should redirect to login if no token", async () => {
            app.get('/protected', { preHandler: authenticateWeb }, async () => "ok");

            const response = await app.inject({
                method: 'GET',
                url: '/protected'
            });

            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe('/login');
        });

        it("should authenticate active user", async () => {
            const token = jwt.sign({ userId: testUser.id, role: 'ADMIN' }, process.env.JWT_SECRET!);

            app.get('/protected', { preHandler: authenticateWeb }, async (req) => (req as any).user.id);

            const response = await app.inject({
                method: 'GET',
                url: '/protected',
                cookies: { admin_token: token }
            });

            expect(response.statusCode).toBe(200);
            expect(response.payload).toBe(testUser.id);
        });

        it("should redirect if authenticated visiting login", async () => {
            const token = jwt.sign({ userId: testUser.id, role: 'ADMIN' }, process.env.JWT_SECRET!);

            app.get('/login', { preHandler: redirectIfAuthenticated }, async () => "login page");

            const response = await app.inject({
                method: 'GET',
                url: '/login',
                cookies: { admin_token: token }
            });

            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe('/dashboard');
        });

        it("should continue if not authenticated visiting login", async () => {
            app.get('/login', { preHandler: redirectIfAuthenticated }, async () => "login page");

            const response = await app.inject({
                method: 'GET',
                url: '/login'
            });

            expect(response.statusCode).toBe(200);
            expect(response.payload).toBe("login page");
        });
    });
});
