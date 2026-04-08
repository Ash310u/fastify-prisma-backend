import { FastifyPluginAsync } from "fastify";
import {
  type UpdateUserBody,
  createUserHandler,
  createUserSessionHandler,
  deleteUserHandler,
  getCurrentUserSessionHandler,
  getUserByIdHandler,
  getUserRoleInsightsHandler,
  listUsersHandler,
  updateUserHandler,
} from "../../handlers/user.handler";

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", { preHandler: fastify.authenticate }, listUsersHandler);
  fastify.get("/:id", { preHandler: fastify.authenticate }, getUserByIdHandler);
  fastify.get("/:id/insights", { preHandler: fastify.authenticate }, getUserRoleInsightsHandler);
  fastify.post("/", createUserHandler);
  fastify.post("/login", createUserSessionHandler);
  fastify.post("/session", createUserSessionHandler);
  fastify.get("/session", { preHandler: fastify.authenticate }, getCurrentUserSessionHandler);
  fastify.put<{ Body: UpdateUserBody }>(
    "/:id",
    { preHandler: fastify.authenticate },
    updateUserHandler,
  );
  fastify.delete("/:id", { preHandler: fastify.authenticate }, deleteUserHandler);
};

export default userRoutes;
