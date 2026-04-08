import { FastifyPluginAsync } from "fastify";
import {
  createUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUserRoleInsightsHandler,
  listUsersHandler,
  updateUserHandler,
} from "../../handlers/user.handler";

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", listUsersHandler);
  fastify.get("/:id", getUserByIdHandler);
  fastify.get("/:id/insights", getUserRoleInsightsHandler);
  fastify.post("/", createUserHandler);
  fastify.put("/:id", updateUserHandler);
  fastify.delete("/:id", deleteUserHandler);
};

export default userRoutes;
