import { FastifyPluginAsync } from "fastify";
import {
  createReportHandler,
  deleteReportHandler,
  getReportByIdHandler,
  listReportsHandler,
  updateReportHandler,
} from "../../handlers/report.handler";

const reportRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", listReportsHandler);
  fastify.get("/:id", getReportByIdHandler);
  fastify.post("/", createReportHandler);
  fastify.put("/:id", updateReportHandler);
  fastify.delete("/:id", deleteReportHandler);
};

export default reportRoutes;