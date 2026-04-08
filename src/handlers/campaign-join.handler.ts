import { FastifyReply, FastifyRequest } from "fastify";
import { handlePrismaCrudError, parseNumericId, replyInvalidId } from "./crud.utils";

export type CreateCampaignJoinBody = {
  campaignId: number;
  userId: number;
};

export type UpdateCampaignJoinBody = {
  campaignId?: number;
  userId?: number;
};

export async function createCampaignJoinHandler(
  request: FastifyRequest<{ Body: CreateCampaignJoinBody }>,
  reply: FastifyReply,
) {
  try {
    const campaignJoin = await request.server.prisma.campaignJoin.create({
      data: request.body,
    });

    return reply.code(201).send(campaignJoin);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function listCampaignJoinsHandler(_request: FastifyRequest, reply: FastifyReply) {
  const campaignJoins = await reply.server.prisma.campaignJoin.findMany();
  return reply.send(campaignJoins);
}

export async function getCampaignJoinByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const campaignJoin = await request.server.prisma.campaignJoin.findUnique({ where: { id } });

  if (!campaignJoin) {
    return reply.code(404).send({ message: "Campaign join not found" });
  }

  return reply.send(campaignJoin);
}

export async function updateCampaignJoinHandler(
  request: FastifyRequest<{ Body: UpdateCampaignJoinBody }>,
  reply: FastifyReply,
) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  try {
    const campaignJoin = await request.server.prisma.campaignJoin.update({
      where: { id },
      data: request.body,
    });

    return reply.send(campaignJoin);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function deleteCampaignJoinHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  try {
    await request.server.prisma.campaignJoin.delete({ where: { id } });
    return reply.code(204).send();
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}
