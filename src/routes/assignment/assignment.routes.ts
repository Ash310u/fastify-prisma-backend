import { FastifyPluginAsync } from "fastify";
import {
  type CreateAssignmentBody,
  type UpdateAssignmentBody,
  createAssignmentHandler,
  deleteAssignmentHandler,
  getAssignmentByIdHandler,
  listAssignmentsHandler,
  updateAssignmentHandler,
} from "../../handlers/assignment.handler";

const assignmentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", { preHandler: fastify.authenticate }, listAssignmentsHandler);
  fastify.get("/:id", { preHandler: fastify.authenticate }, getAssignmentByIdHandler);
  fastify.post<{ Body: CreateAssignmentBody }>(
    "/",
    { preHandler: fastify.authenticate },
    createAssignmentHandler,
  );
  fastify.put<{ Body: UpdateAssignmentBody }>(
    "/:id",
    { preHandler: fastify.authenticate },
    updateAssignmentHandler,
  );
  fastify.delete("/:id", { preHandler: fastify.authenticate }, deleteAssignmentHandler);
};

export default assignmentRoutes;
