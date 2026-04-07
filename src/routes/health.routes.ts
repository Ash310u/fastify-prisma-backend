import { FastifyPluginAsync } from "fastify";
import { healthHandler } from "../handlers/health.handler";

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", healthHandler);
};

export default healthRoutes;
