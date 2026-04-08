import assert from "node:assert/strict";
import test from "node:test";
import { UserRole } from "../generated/prisma/client";
import { buildTestApp } from "./helpers/app";

test("GET /api/users returns all users", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const users = [
    {
      id: 1,
      name: "Aarav Sharma",
      email: "aarav@example.com",
      passwordHash: "hashed_password_value",
      role: UserRole.citizen,
      city: "Bhopal",
    },
  ];

  prisma.user.findMany.mockResolvedValue(users);

  const response = await app.inject({
    method: "GET",
    url: "/api/users",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), users);
  assert.equal(prisma.user.findMany.calls.length, 1);
});

test("GET /api/users/:id returns one user", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const user = {
    id: 7,
    name: "Neha Singh",
    email: "neha@example.com",
    passwordHash: "hash",
    role: UserRole.authority,
    city: "Indore",
  };

  prisma.user.findUnique.mockResolvedValue(user);

  const response = await app.inject({
    method: "GET",
    url: "/api/users/7",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), user);
  assert.deepEqual(prisma.user.findUnique.calls[0]?.[0], { where: { id: 7 } });
});

test("POST /api/users creates a user", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    name: "Ishita Verma",
    email: "ishita@example.com",
    passwordHash: "new_hash",
    role: UserRole.admin,
    city: "Pune",
  };

  const createdUser = { id: 9, ...payload };
  prisma.user.create.mockResolvedValue(createdUser);

  const response = await app.inject({
    method: "POST",
    url: "/api/users",
    payload,
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), createdUser);
  assert.deepEqual(prisma.user.create.calls[0]?.[0], { data: payload });
});

test("PUT /api/users/:id updates a user", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    city: "Indore",
    role: UserRole.authority,
  };

  const updatedUser = {
    id: 4,
    name: "Rohan Das",
    email: "rohan@example.com",
    passwordHash: "hash",
    ...payload,
  };

  prisma.user.update.mockResolvedValue(updatedUser);

  const response = await app.inject({
    method: "PUT",
    url: "/api/users/4",
    payload,
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), updatedUser);
  assert.deepEqual(prisma.user.update.calls[0]?.[0], {
    where: { id: 4 },
    data: payload,
  });
});

test("DELETE /api/users/:id removes a user", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "DELETE",
    url: "/api/users/3",
  });

  assert.equal(response.statusCode, 204);
  assert.deepEqual(prisma.user.delete.calls[0]?.[0], { where: { id: 3 } });
});

test("GET /api/users/:id/insights returns authority insights", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  prisma.user.findUnique.mockResolvedValue({
    id: 5,
    name: "Inspector Rao",
    email: "inspector@example.com",
    passwordHash: "hash",
    role: UserRole.authority,
    city: "Bhopal",
    impactScore: 20,
  });

  let authorityCountCalls = 0;
  prisma.assignment.count.mockImplementation(async () => {
    authorityCountCalls += 1;
    return authorityCountCalls === 1 ? 6 : 3;
  });

  prisma.assignment.findMany.mockResolvedValue([
    {
      report: {
        id: 91,
        addressText: "Lake View Road",
        garbageType: "plastic",
        severity: "high",
        status: "assigned",
        createdAt: new Date("2026-04-08T07:30:00.000Z"),
      },
    },
  ]);

  prisma.assignment.findMany.mockImplementation(async (args) => {
    const where = (args as { where?: { resolvedAt?: unknown } } | undefined)?.where;
    const isAverageQuery = where?.resolvedAt && typeof where.resolvedAt === "object";

    if (isAverageQuery) {
      return [
        {
          assignedAt: new Date("2026-04-08T08:00:00.000Z"),
          resolvedAt: new Date("2026-04-08T10:00:00.000Z"),
        },
        {
          assignedAt: new Date("2026-04-08T09:00:00.000Z"),
          resolvedAt: new Date("2026-04-08T12:00:00.000Z"),
        },
      ];
    }

    return [
      {
        report: {
          id: 91,
          addressText: "Lake View Road",
          garbageType: "plastic",
          severity: "high",
          status: "assigned",
          createdAt: new Date("2026-04-08T07:30:00.000Z"),
        },
      },
    ];
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/users/5/insights",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(prisma.assignment.count.calls.length, 2);
  assert.equal(prisma.assignment.findMany.calls.length, 2);

  const payload = response.json();
  assert.equal(payload.role, UserRole.authority);
  assert.equal(payload.todayTotalReports, 6);
  assert.equal(payload.resolvedThisWeek, 3);
  assert.equal(payload.avgTimeToResolveHours, 2.5);
  assert.equal(payload.unresolvedReports.length, 1);
});

test("GET /api/users/:id/insights returns org insights scoped by city", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  prisma.user.findUnique.mockResolvedValue({
    id: 8,
    name: "City Org",
    email: "org@example.com",
    passwordHash: "hash",
    role: UserRole.org,
    city: "Indore",
    impactScore: 30,
  });

  let reportCountCalls = 0;
  prisma.report.count.mockImplementation(async () => {
    reportCountCalls += 1;
    return reportCountCalls === 1 ? 10 : 4;
  });

  prisma.report.findMany.mockImplementation(async (args) => {
    const select = (args as { select?: unknown } | undefined)?.select;

    if (select) {
      return [
        {
          createdAt: new Date("2026-04-07T08:00:00.000Z"),
          resolvedAt: new Date("2026-04-07T12:00:00.000Z"),
        },
      ];
    }

    return [
      {
        id: 44,
        userId: 11,
        addressText: "MG Road",
        garbageType: "mixed",
        severity: "medium",
        status: "assigned",
        createdAt: new Date("2026-04-08T06:00:00.000Z"),
      },
    ];
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/users/8/insights",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(prisma.report.count.calls.length, 2);
  assert.equal(prisma.report.findMany.calls.length, 2);

  const firstCountWhere = (prisma.report.count.calls[0]?.[0] as { where?: { user?: { city?: string } } })
    ?.where;
  assert.equal(firstCountWhere?.user?.city, "Indore");

  const payload = response.json();
  assert.equal(payload.role, UserRole.org);
  assert.equal(payload.cityScope, "Indore");
  assert.equal(payload.todayTotalReports, 10);
  assert.equal(payload.resolvedThisWeek, 4);
  assert.equal(payload.avgTimeToResolveHours, 4);
  assert.equal(payload.unresolvedReports.length, 1);
});

test("GET /api/users/:id/insights rejects non-privileged roles", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  prisma.user.findUnique.mockResolvedValue({
    id: 2,
    name: "Regular User",
    email: "citizen@example.com",
    passwordHash: "hash",
    role: UserRole.citizen,
    city: "Bhopal",
    impactScore: 2,
  });

  const response = await app.inject({
    method: "GET",
    url: "/api/users/2/insights",
  });
  assert.equal(response.statusCode, 403);
  assert.equal(prisma.assignment.count.calls.length, 0);
  assert.equal(prisma.report.count.calls.length, 0);
});
