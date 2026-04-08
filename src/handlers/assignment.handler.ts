import { FastifyReply, FastifyRequest } from "fastify";
import { handlePrismaCrudError, parseNumericId, replyInvalidId } from "./crud.utils";

type CreateAssignmentBody = {
  reportId: number;
  authorityId: number;
  resolvedAt?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
};

type UpdateAssignmentBody = {
  reportId?: number;
  authorityId?: number;
  resolvedAt?: string | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
};

export async function createAssignmentHandler(
  request: FastifyRequest<{ Body: CreateAssignmentBody }>,
  reply: FastifyReply,
) {
  const { resolvedAt, ...rest } = request.body;

  try {
    const assignment = await request.server.prisma.assignment.create({
      data: {
        ...rest,
        ...(resolvedAt ? { resolvedAt: new Date(resolvedAt) } : {}),
      },
    });

    return reply.code(201).send(assignment);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function listAssignmentsHandler(_request: FastifyRequest, reply: FastifyReply) {
  const assignments = await reply.server.prisma.assignment.findMany();
  return reply.send(assignments);
}

export async function getAssignmentByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const assignment = await request.server.prisma.assignment.findUnique({ where: { id } });

  if (!assignment) {
    return reply.code(404).send({ message: "Assignment not found" });
  }

  return reply.send(assignment);
}

export async function updateAssignmentHandler(
  request: FastifyRequest<{ Body: UpdateAssignmentBody }>,
  reply: FastifyReply,
) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const { resolvedAt, ...rest } = request.body;

  try {
    const assignment = await request.server.prisma.assignment.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedAt === null ? { resolvedAt: null } : {}),
        ...(typeof resolvedAt === "string" ? { resolvedAt: new Date(resolvedAt) } : {}),
      },
    });

    return reply.send(assignment);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function deleteAssignmentHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  try {
    await request.server.prisma.assignment.delete({ where: { id } });
    return reply.code(204).send();
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}