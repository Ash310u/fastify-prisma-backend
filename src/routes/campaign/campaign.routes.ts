import { FastifyPluginAsync } from "fastify";
import {
  type CreateCampaignBody,
  type UpdateCampaignBody,
  createCampaignHandler,
  deleteCampaignHandler,
  getCampaignByIdHandler,
  listCampaignsHandler,
  updateCampaignHandler,
} from "../../handlers/campaign.handler";

const campaignRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", { preHandler: fastify.authenticate }, listCampaignsHandler);
  fastify.get("/:id", { preHandler: fastify.authenticate }, getCampaignByIdHandler);
  fastify.post<{ Body: CreateCampaignBody }>(
    "/",
    { preHandler: fastify.authenticate },
    createCampaignHandler,
  );
  fastify.put<{ Body: UpdateCampaignBody }>(
    "/:id",
    { preHandler: fastify.authenticate },
    updateCampaignHandler,
  );
  fastify.delete("/:id", { preHandler: fastify.authenticate }, deleteCampaignHandler);
};

export default campaignRoutes;
