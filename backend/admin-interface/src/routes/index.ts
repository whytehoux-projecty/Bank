import { FastifyInstance } from "fastify";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import webRoutes from "./web";
import mockApiRoutes from "./mockApi";

export default async function routes(fastify: FastifyInstance) {
  // Health check endpoint (public)
  fastify.get("/health", async (_request, reply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Aurum Vault Admin Interface",
      version: "1.0.0",
    });
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(adminRoutes, { prefix: "/api/admin" });
  await fastify.register(webRoutes);
  
  // TEMPORARY: Mock API routes for development (when auth is disabled)
  await fastify.register(mockApiRoutes);
}
