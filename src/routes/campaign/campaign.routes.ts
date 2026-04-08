import { FastifyPluginAsync } from "fastify";
import {
  createCampaignHandler,
  deleteCampaignHandler,
  getCampaignByIdHandler,
  listCampaignsHandler,
  updateCampaignHandler,
} from "../../handlers/campaign.handler";

const campaignRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", listCampaignsHandler);
  fastify.get("/:id", getCampaignByIdHandler);
  fastify.post("/", createCampaignHandler);
  fastify.put("/:id", updateCampaignHandler);
  fastify.delete("/:id", deleteCampaignHandler);
};

export default campaignRoutes;