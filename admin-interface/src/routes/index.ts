import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import authRoutes from "./auth";
import adminRoutes from "./admin";
import portalStatusApiRoutes from "./portal-status";
import verificationApiRoutes from "./verifications";
import settingsApiRoutes from "./admin/settings";
import extendedApiRoutes from "./extended-api";

export default async function routes(fastify: FastifyInstance) {
  // Health check endpoint (public)
  fastify.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "AURUM VAULT Admin Interface",
      version: "1.0.0",
    });
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(adminRoutes, { prefix: "/admin" });
  await fastify.register(portalStatusApiRoutes);
  await fastify.register(verificationApiRoutes);
  await fastify.register(settingsApiRoutes, { prefix: "/admin/settings" });

  // Extended API routes (notifications, bulk operations, reports, timeline, 2FA)
  await fastify.register(extendedApiRoutes, { prefix: "/extended" });
}
