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
