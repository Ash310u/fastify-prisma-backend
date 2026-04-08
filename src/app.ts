import Fastify, { FastifyInstance } from "fastify";
import prismaPlugin from "./plugins/prisma";
import authPlugin from "./plugins/auth";
import routes from "./routes";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(authPlugin);
  await app.register(prismaPlugin);
  await app.register(routes);

  return app;
}
