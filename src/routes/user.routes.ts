import { FastifyPluginAsync } from "fastify";
import { createUserHandler, listUsersHandler } from "../handlers/user.handler";

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/users", listUsersHandler);
  fastify.post("/users", createUserHandler);
};

export default userRoutes;
