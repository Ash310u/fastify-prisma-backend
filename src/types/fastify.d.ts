import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaClient } from "../../generated/prisma/client";
import { UserRole } from "../../generated/prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
  }

  interface FastifyRequest {
    authUser: {
      userId: number;
      role: UserRole;
      email: string;
    } | null;
  }
}
