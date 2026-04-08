import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { UserRole } from "../../generated/prisma/client";

type AuthTokenPayload = {
  userId: number;
  role: UserRole;
  email: string;
};

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const secret = process.env.JWT_SECRET ?? "dev-jwt-secret";

  await fastify.register(fastifyJwt, {
    secret,
  });

  fastify.decorateRequest("authUser", null);

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as AuthTokenPayload;
      request.authUser = {
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
      };
    } catch {
      return reply.code(401).send({ message: "Unauthorized" });
    }
  });
};

export default fp(authPlugin);