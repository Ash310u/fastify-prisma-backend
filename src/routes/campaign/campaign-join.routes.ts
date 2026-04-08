import { FastifyPluginAsync } from "fastify";
import {
  createCampaignJoinHandler,
  deleteCampaignJoinHandler,
  getCampaignJoinByIdHandler,
  listCampaignJoinsHandler,
  updateCampaignJoinHandler,
} from "../../handlers/campaign-join.handler";

const campaignJoinRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", listCampaignJoinsHandler);
  fastify.get("/:id", getCampaignJoinByIdHandler);
  fastify.post("/", createCampaignJoinHandler);
  fastify.put("/:id", updateCampaignJoinHandler);
  fastify.delete("/:id", deleteCampaignJoinHandler);
};

export default campaignJoinRoutes;