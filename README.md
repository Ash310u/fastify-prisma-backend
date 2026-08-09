# BinSight

> Fastify and Prisma REST API on PostgreSQL/PostGIS for AI-validated, geospatial waste reporting and municipal assignment workflows.

## What this is

A backend service for civic waste management. Citizens submit geotagged photographs of waste incidents; the platform validates submissions through Google Gemini vision analysis, persists structured reports in PostgreSQL with PostGIS, and supports assignment to municipal authorities. Organizations and administrators access operational insights, and users can participate in coordinated cleanup campaigns.

Access is organized around four roles: `citizen`, `authority`, `org`, and `admin`.

## How it's built

**Fastify** handles HTTP. **Prisma** talks to **PostgreSQL with PostGIS** for storing report locations as map points. **JWT** (`@fastify/jwt`) protects most routes after login.

The interesting bit is report creation. When a citizen hits `POST /api/reports`, the handler calls `src/services/geminiVision.ts`, which asks Gemini 2.5 Flash to return category, severity, and confidence. If the model doesn't see garbage or confidence is below 0.6, the request is rejected. Otherwise the report gets inserted with raw SQL so PostGIS can store the coordinates properly.

Project layout:

```
src/
  server.ts          → starts the app
  app.ts             → wires plugins and routes
  plugins/           → cors, prisma, jwt auth
  routes/            → route definitions (thin)
  handlers/          → request logic
  services/          → gemini vision analysis
prisma/
  schema.prisma      → users, reports, assignments, campaigns
test/                → route tests (node:test)
```

Main API groups:

| Route | What it does |
|-------|----------------|
| `GET /health` | Health check |
| `/api/users` | Register, login, CRUD, role-based insights |
| `/api/reports` | CRUD — create runs AI analysis |
| `/api/assignments` | Link reports to authorities |
| `/api/campaigns` | Cleanup events |
| `/api/campaign-joins` | Users joining campaigns |

Most endpoints need `Authorization: Bearer <token>`. Register and login are open.

## How to run it

**Requirements:** Node.js, Docker

1. Clone and install:

```bash
npm install
```

2. Copy env and fill in values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your-secret-here
GEMINI_API_KEY=your-gemini-key
```

3. Start the database:

```bash
docker compose up -d
```

4. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the dev server:

```bash
npm run dev
```

Server listens on `http://localhost:3000`.

**Other useful commands:**

```bash
npm run build          # compile TypeScript
npm run start          # run compiled output
npm test               # run route tests
npm run prisma:studio  # open Prisma Studio
```

**Quick smoke test:**

```bash
# health
curl http://localhost:3000/health

# register
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","passwordHash":"secret","role":"citizen","city":"Bhopal"}'

# login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","passwordHash":"secret"}'
```

Use the token from login on protected routes.
