import { FastifyPluginAsync } from "fastify";
import healthRoutes from "./health.routes";
import userRoutes from "./users/user.routes";
import reportRoutes from "./report/report.routes";
import assignmentRoutes from "./assignment/assignment.routes";
import campaignRoutes from "./campaign/campaign.routes";
import campaignJoinRoutes from "./campaign/campaign-join.routes";

const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(healthRoutes);
  await fastify.register(userRoutes, { prefix: "/api/users" });
  await fastify.register(reportRoutes, { prefix: "/api/reports" });
  await fastify.register(assignmentRoutes, { prefix: "/api/assignments" });
  await fastify.register(campaignRoutes, { prefix: "/api/campaigns" });
  await fastify.register(campaignJoinRoutes, { prefix: "/api/campaign-joins" });
};

export default routes;
