
import Fastify, { FastifyInstance } from "fastify";
import portalStatusApiRoutes from "../src/routes/portal-status";
import axios from "axios";
import fastifyCookie from "@fastify/cookie";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Portal Status Proxy Routes", () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = Fastify();
        app.register(fastifyCookie);
        await app.register(portalStatusApiRoutes);
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await app.close();
    });

    it("GET /api/portal/status should require auth", async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/portal/status'
        });
        expect(response.statusCode).toBe(401);
    });

    it("GET /api/portal/status should proxy request", async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { status: 'ONLINE' } });

        const response = await app.inject({
            method: 'GET',
            url: '/api/portal/status',
            cookies: { admin_token: "test-token" }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: 'ONLINE' });
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining('/api/portal/status'),
            expect.objectContaining({ headers: expect.objectContaining({ 'Authorization': 'Bearer test-token' }) })
        );
    });

    it("POST /api/portal/status should proxy request", async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

        const response = await app.inject({
            method: 'POST',
            url: '/api/portal/status',
            cookies: { admin_token: "test-token" },
            payload: { status: "MAINTENANCE" }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ success: true });
        expect(mockedAxios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/portal/status'),
            { status: "MAINTENANCE" },
            expect.any(Object)
        );
    });

    it("GET /api/portal/status/history should proxy request", async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: [] });

        const response = await app.inject({
            method: 'GET',
            url: '/api/portal/status/history',
            cookies: { admin_token: "test-token" }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual([]);
    });

    it("GET /api/portal/health should proxy request (public)", async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { status: 'OK' } });

        const response = await app.inject({
            method: 'GET',
            url: '/api/portal/health'
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: 'OK' });
    });

    it("should handle backend error response", async () => {
        mockedAxios.get.mockRejectedValueOnce({
            response: {
                status: 400,
                data: { error: "Bad Request" }
            },
            message: "Request failed"
        });

        const response = await app.inject({
            method: 'GET',
            url: '/api/portal/status',
            cookies: { admin_token: "test-token" }
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({ error: "Bad Request" });
    });

    it("should handle network error", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

        const response = await app.inject({
            method: 'GET',
            url: '/api/portal/status',
            cookies: { admin_token: "test-token" }
        });

        expect(response.statusCode).toBe(500);
        expect(response.json().error.code).toBe("INTERNAL_ERROR");
    });
});
