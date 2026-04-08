import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  const configuredOrigins = process.env.CORS_ORIGIN;
  const allowedOrigins = configuredOrigins
    ? configuredOrigins.split(",").map((origin) => origin.trim())
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5173/*"];

  fastify.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Vary", "Origin");
    }

    reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }
  });
};

export default fp(corsPlugin);
