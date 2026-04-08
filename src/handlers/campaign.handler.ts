import { FastifyReply, FastifyRequest } from "fastify";
import { handlePrismaCrudError, parseNumericId, replyInvalidId } from "./crud.utils";

type CreateCampaignBody = {
  createdBy: number;
  title: string;
  description: string;
  city: string;
  date: string;
  participantCount?: number;
};

type UpdateCampaignBody = {
  createdBy?: number;
  title?: string;
  description?: string;
  city?: string;
  date?: string;
  participantCount?: number;
};

export async function createCampaignHandler(
  request: FastifyRequest<{ Body: CreateCampaignBody }>,
  reply: FastifyReply,
) {
  const { date, ...rest } = request.body;

  try {
    const campaign = await request.server.prisma.campaign.create({
      data: {
        ...rest,
        date: new Date(date),
      },
    });

    return reply.code(201).send(campaign);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function listCampaignsHandler(_request: FastifyRequest, reply: FastifyReply) {
  const campaigns = await reply.server.prisma.campaign.findMany();
  return reply.send(campaigns);
}

export async function getCampaignByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const campaign = await request.server.prisma.campaign.findUnique({ where: { id } });

  if (!campaign) {
    return reply.code(404).send({ message: "Campaign not found" });
  }

  return reply.send(campaign);
}

export async function updateCampaignHandler(
  request: FastifyRequest<{ Body: UpdateCampaignBody }>,
  reply: FastifyReply,
) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const { date, ...rest } = request.body;

  try {
    const campaign = await request.server.prisma.campaign.update({
      where: { id },
      data: {
        ...rest,
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    return reply.send(campaign);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function deleteCampaignHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  try {
    await request.server.prisma.campaign.delete({ where: { id } });
    return reply.code(204).send();
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}