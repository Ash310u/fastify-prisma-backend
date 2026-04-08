import { FastifyPluginAsync } from "fastify";
import {
  createUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  listUsersHandler,
  updateUserHandler,
} from "../../handlers/user.handler";

const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", listUsersHandler);
  fastify.get("/:id", getUserByIdHandler);
  fastify.post("/", createUserHandler);
  fastify.put("/:id", updateUserHandler);
  fastify.delete("/:id", deleteUserHandler);
};

export default userRoutes;
