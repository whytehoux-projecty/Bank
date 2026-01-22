
import Fastify, { FastifyInstance } from "fastify";
import mockApiRoutes from "../src/routes/mockApi";

describe("Mock API Routes", () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = Fastify();
        await app.register(mockApiRoutes);
    });

    afterEach(async () => {
        await app.close();
    });

    it("should return dashboard stats", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/dashboard/stats'
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.totalUsers).toBeDefined();
    });

    it("should return users list", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/users'
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.users).toHaveLength(3);
    });

    it("should return accounts list", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/accounts'
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.accounts).toHaveLength(3);
    });

    it("should return transactions list", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/transactions'
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.transactions).toHaveLength(3);
    });

    it("should approve transaction", async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/transactions/1/approve'
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
    });

    it("should reject transaction", async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/transactions/1/reject'
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
    });

    it("should export transactions", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/transactions/export'
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toBe('text/csv');
    });
});
