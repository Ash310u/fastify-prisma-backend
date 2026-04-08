import { FastifyPluginAsync } from "fastify";
import {
  type CreateCampaignJoinBody,
  type UpdateCampaignJoinBody,
  createCampaignJoinHandler,
  deleteCampaignJoinHandler,
  getCampaignJoinByIdHandler,
  listCampaignJoinsHandler,
  updateCampaignJoinHandler,
} from "../../handlers/campaign-join.handler";

const campaignJoinRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", { preHandler: fastify.authenticate }, listCampaignJoinsHandler);
  fastify.get("/:id", { preHandler: fastify.authenticate }, getCampaignJoinByIdHandler);
  fastify.post<{ Body: CreateCampaignJoinBody }>(
    "/",
    { preHandler: fastify.authenticate },
    createCampaignJoinHandler,
  );
  fastify.put<{ Body: UpdateCampaignJoinBody }>(
    "/:id",
    { preHandler: fastify.authenticate },
    updateCampaignJoinHandler,
  );
  fastify.delete("/:id", { preHandler: fastify.authenticate }, deleteCampaignJoinHandler);
};

export default campaignJoinRoutes;
