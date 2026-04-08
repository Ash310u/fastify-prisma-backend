import { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "../../generated/prisma/client";

export function parseNumericId(request: FastifyRequest): number | null {
  const params = request.params as { id?: string };
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export function replyInvalidId(reply: FastifyReply) {
  return reply.code(400).send({ message: "Invalid id parameter" });
}

export function handlePrismaCrudError(error: unknown, reply: FastifyReply) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return reply.code(404).send({ message: "Resource not found" });
    }

    if (error.code === "P2002") {
      return reply.code(409).send({ message: "Unique constraint violation" });
    }
  }

  throw error;
}