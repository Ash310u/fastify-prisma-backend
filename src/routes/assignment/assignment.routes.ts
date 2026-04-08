import { FastifyPluginAsync } from "fastify";
import {
  createAssignmentHandler,
  deleteAssignmentHandler,
  getAssignmentByIdHandler,
  listAssignmentsHandler,
  updateAssignmentHandler,
} from "../../handlers/assignment.handler";

const assignmentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", listAssignmentsHandler);
  fastify.get("/:id", getAssignmentByIdHandler);
  fastify.post("/", createAssignmentHandler);
  fastify.put("/:id", updateAssignmentHandler);
  fastify.delete("/:id", deleteAssignmentHandler);
};

export default assignmentRoutes;