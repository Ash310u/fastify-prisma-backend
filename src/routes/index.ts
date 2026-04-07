import { FastifyPluginAsync } from "fastify";
import healthRoutes from "./health.routes";
import userRoutes from "./user.routes";

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(healthRoutes);
  await fastify.register(userRoutes, { prefix: "/api" });
};

export default routes;
