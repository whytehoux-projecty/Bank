
import { DatabaseHealthCheck } from "../src/lib/database-health";
import { configureSecurityHeaders } from "../src/lib/security";
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, RateLimitError, createErrorHandler } from "../src/lib/errors";
import { env } from "../src/config/env";
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

describe("Library Tests", () => {
    describe("DatabaseHealthCheck", () => {
        let healthCheck: DatabaseHealthCheck;

        beforeEach(() => {
            healthCheck = DatabaseHealthCheck.getInstance();
        });

        afterAll(async () => {
            await healthCheck.disconnect();
        });

        it("should be a singleton", () => {
            const instance1 = DatabaseHealthCheck.getInstance();
            const instance2 = DatabaseHealthCheck.getInstance();
            expect(instance1).toBe(instance2);
        });

        it("should check health successfully", async () => {
            const result = await healthCheck.checkHealth();
            // Since we are connected to DB in test env
            expect(result.status).toBe("healthy");
            expect(result.responseTime).toBeGreaterThanOrEqual(0);
            expect(result.lastCheck).toBeInstanceOf(Date);

            const status = healthCheck.getLastHealthStatus();
            expect(status.isHealthy).toBe(true);
            expect(status.lastCheck).toBeInstanceOf(Date);
        });

        it("should get connection info", async () => {
            const info = await healthCheck.getConnectionInfo();
            expect(info).toBeDefined();
            // PostgreSQL specific check
            expect(info.activeConnections).toBeDefined();
        });
    });

    describe("Security Headers", () => {
        let app: FastifyInstance;

        beforeEach(() => {
            app = Fastify();
            configureSecurityHeaders(app);
            app.get('/', async () => "ok");
        });

        afterEach(() => {
            app.close();
        });

        it("should set security headers", async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/'
            });

            expect(response.headers['content-security-policy']).toBeDefined();
            // HSTS is only enabled in production
            if (process.env.NODE_ENV === 'production') {
                expect(response.headers['strict-transport-security']).toBeDefined();
            }
            expect(response.headers['x-xss-protection']).toBe('1; mode=block');
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        });
    });

    describe("Errors", () => {
        it("should create AppError correctly", () => {
            const err = new AppError("Test Error", 500, true);
            expect(err.message).toBe("Test Error");
            expect(err.statusCode).toBe(500);
            expect(err.isOperational).toBe(true);
        });

        it("should create specific errors correctly", () => {
            expect(new ValidationError("Val Error").statusCode).toBe(400);
            expect(new AuthenticationError("Auth Error").statusCode).toBe(401);
            expect(new AuthorizationError("Authz Error").statusCode).toBe(403);
            expect(new NotFoundError("Not Found").statusCode).toBe(404);
            expect(new ConflictError("Conflict").statusCode).toBe(409);
            expect(new RateLimitError("Rate Limit").statusCode).toBe(429);
        });

        it("should handle errors with createErrorHandler", async () => {
            const handler = createErrorHandler();
            const request = {
                id: "123",
                log: { error: jest.fn() },
                url: "/test",
                method: "GET",
                headers: {}
            } as unknown as FastifyRequest;

            const reply = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as FastifyReply;

            // Validation Error
            const validationErr = { validation: [{ message: "Invalid" }] } as any;
            handler(validationErr, request, reply);
            expect(reply.status).toHaveBeenCalledWith(400);

            // App Error
            const appErr = new NotFoundError("Not found");
            handler(appErr as any, request, reply);
            expect(reply.status).toHaveBeenCalledWith(404);

            // Unknown Error
            const unknownErr = new Error("Boom");
            handler(unknownErr as any, request, reply);
            expect(reply.status).toHaveBeenCalledWith(500);
        });
    });

    describe("Environment Config", () => {
        it("should have required variables", () => {
            expect(env.DATABASE_URL).toBeDefined();
            expect(env.JWT_SECRET).toBeDefined();
        });
    });
});
