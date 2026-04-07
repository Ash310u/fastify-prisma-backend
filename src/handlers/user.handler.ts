import { FastifyReply, FastifyRequest } from "fastify";

type CreateUserBody = {
  email: string;
};

export async function listUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const users = await request.server.prisma.user.findMany({
    orderBy: { id: "asc" },
  });

  return reply.send(users);
}

export async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply,
) {
  const { email } = request.body;

  const user = await request.server.prisma.user.create({
    data: { email },
  });

  return reply.code(201).send(user);
}
