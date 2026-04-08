import { FastifyPluginAsync } from "fastify";
import {
  type CreateReportBody,
  type UpdateReportBody,
  createReportHandler,
  deleteReportHandler,
  getReportByIdHandler,
  listReportsHandler,
  updateReportHandler,
} from "../../handlers/report.handler";

const reportRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", { preHandler: fastify.authenticate }, listReportsHandler);
  fastify.get("/:id", { preHandler: fastify.authenticate }, getReportByIdHandler);
  fastify.post<{ Body: CreateReportBody }>(
    "/",
    { preHandler: fastify.authenticate },
    createReportHandler,
  );
  fastify.put<{ Body: UpdateReportBody }>(
    "/:id",
    { preHandler: fastify.authenticate },
    updateReportHandler,
  );
  fastify.delete("/:id", { preHandler: fastify.authenticate }, deleteReportHandler);
};

export default reportRoutes;
