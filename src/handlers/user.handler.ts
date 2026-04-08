import { FastifyReply, FastifyRequest } from "fastify";
import { UserRole } from "../../generated/prisma/client";
import { handlePrismaCrudError, parseNumericId, replyInvalidId } from "./crud.utils";

type CreateUserBody = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  city: string;
  impactScore?: number;
};

type UpdateUserBody = {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  city?: string;
  impactScore?: number;
};

export async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply,
) {
  const { name, email, passwordHash, role, city, impactScore } = request.body;

  try {
    const user = await request.server.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        city,
        ...(impactScore !== undefined ? { impactScore } : {}),
      },
    });

    return reply.code(201).send(user);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function listUsersHandler(_request: FastifyRequest, reply: FastifyReply) {
  const users = await reply.server.prisma.user.findMany();
  return reply.send(users);
}

export async function getUserByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const user = await request.server.prisma.user.findUnique({ where: { id } });

  if (!user) {
    return reply.code(404).send({ message: "User not found" });
  }

  return reply.send(user);
}

export async function updateUserHandler(
  request: FastifyRequest<{ Body: UpdateUserBody }>,
  reply: FastifyReply,
) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  const data = request.body;

  try {
    const user = await request.server.prisma.user.update({
      where: { id },
      data,
    });

    return reply.send(user);
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}

export async function deleteUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const id = parseNumericId(request);

  if (!id) {
    return replyInvalidId(reply);
  }

  try {
    await request.server.prisma.user.delete({ where: { id } });
    return reply.code(204).send();
  } catch (error) {
    return handlePrismaCrudError(error, reply);
  }
}
