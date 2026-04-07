# fastify-prisma-backend

Basic Fastify + Prisma + PostgreSQL boilerplate with route handlers.

## Stack

- Fastify (HTTP server)
- Prisma ORM
- PostgreSQL (Docker)
- TypeScript

## Setup

1. Install dependencies

```bash
npm install
```

2. Start PostgreSQL

```bash
docker compose up -d
```

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Run migrations

```bash
npm run prisma:migrate
```

5. Start development server

```bash
npm run dev
```

Server runs on `http://localhost:3000` by default.

## Scripts

- `npm run dev` - run in development mode
- `npm run build` - compile TypeScript
- `npm run start` - run compiled server
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - create and apply migration
- `npm run prisma:studio` - open Prisma Studio

## Routes

- `GET /health` -> health check
- `GET /api/users` -> list users
- `POST /api/users` -> create user

Example request:

```bash
curl -X POST http://localhost:3000/api/users \
	-H "Content-Type: application/json" \
	-d '{"email":"john@example.com"}'
```
