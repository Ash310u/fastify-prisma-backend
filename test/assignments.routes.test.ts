import assert from "node:assert/strict";
import test from "node:test";
import { buildTestApp } from "./helpers/app";

test("GET /api/assignments returns all assignments", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const assignments = [
    {
      id: 1,
      reportId: 1,
      authorityId: 2,
      beforeImageUrl: "https://example.com/before.jpg",
      afterImageUrl: "https://example.com/after.jpg",
    },
  ];

  prisma.assignment.findMany.mockResolvedValue(assignments);

  const response = await app.inject({
    method: "GET",
    url: "/api/assignments",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), assignments);
  assert.equal(prisma.assignment.findMany.calls.length, 1);
});

test("GET /api/assignments/:id returns one assignment", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const assignment = {
    id: 4,
    reportId: 2,
    authorityId: 3,
    beforeImageUrl: "https://example.com/before-2.jpg",
    afterImageUrl: "https://example.com/after-2.jpg",
  };

  prisma.assignment.findUnique.mockResolvedValue(assignment);

  const response = await app.inject({
    method: "GET",
    url: "/api/assignments/4",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), assignment);
  assert.deepEqual(prisma.assignment.findUnique.calls[0]?.[0], { where: { id: 4 } });
});

test("POST /api/assignments creates an assignment", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    reportId: 1,
    authorityId: 2,
    resolvedAt: "2026-04-08T12:00:00.000Z",
    beforeImageUrl: "https://example.com/before.jpg",
    afterImageUrl: "https://example.com/after.jpg",
  };

  const createdAssignment = {
    id: 6,
    reportId: payload.reportId,
    authorityId: payload.authorityId,
    resolvedAt: payload.resolvedAt,
    beforeImageUrl: payload.beforeImageUrl,
    afterImageUrl: payload.afterImageUrl,
  };

  prisma.assignment.create.mockResolvedValue(createdAssignment);

  const response = await app.inject({
    method: "POST",
    url: "/api/assignments",
    payload,
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), createdAssignment);

  const createArgs = prisma.assignment.create.calls[0]?.[0] as
    | { data: { resolvedAt?: Date } }
    | undefined;

  assert.ok(createArgs);
  assert.ok(createArgs.data.resolvedAt instanceof Date);
});

test("PUT /api/assignments/:id updates an assignment", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    afterImageUrl: "https://example.com/after-new.jpg",
    resolvedAt: "2026-04-09T09:30:00.000Z",
  };

  const updatedAssignment = {
    id: 3,
    reportId: 1,
    authorityId: 5,
    afterImageUrl: payload.afterImageUrl,
    resolvedAt: payload.resolvedAt,
  };

  prisma.assignment.update.mockResolvedValue(updatedAssignment);

  const response = await app.inject({
    method: "PUT",
    url: "/api/assignments/3",
    payload,
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), updatedAssignment);

  const updateArgs = prisma.assignment.update.calls[0]?.[0] as
    | { where: { id: number }; data: { resolvedAt?: Date } }
    | undefined;

  assert.deepEqual(updateArgs?.where, { id: 3 });
  assert.ok(updateArgs?.data.resolvedAt instanceof Date);
});

test("DELETE /api/assignments/:id removes an assignment", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "DELETE",
    url: "/api/assignments/10",
  });

  assert.equal(response.statusCode, 204);
  assert.deepEqual(prisma.assignment.delete.calls[0]?.[0], { where: { id: 10 } });
});
