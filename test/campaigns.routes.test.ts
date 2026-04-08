import assert from "node:assert/strict";
import test from "node:test";
import { buildTestApp, createAuthHeaders } from "./helpers/app";

test("GET /api/campaigns returns all campaigns", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const campaigns = [
    {
      id: 1,
      createdBy: 1,
      title: "Clean City Drive",
      description: "Weekend cleanup campaign",
      city: "Bhopal",
      date: "2026-04-20T07:30:00.000Z",
      participantCount: 50,
    },
  ];

  prisma.campaign.findMany.mockResolvedValue(campaigns);

  const response = await app.inject({
    method: "GET",
    url: "/api/campaigns",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), campaigns);
  assert.equal(prisma.campaign.findMany.calls.length, 1);
});

test("GET /api/campaigns/:id returns one campaign", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const campaign = {
    id: 2,
    createdBy: 1,
    title: "Lake Cleanup",
    description: "Morning cleanup event",
    city: "Indore",
    date: "2026-04-22T06:00:00.000Z",
    participantCount: 24,
  };

  prisma.campaign.findUnique.mockResolvedValue(campaign);

  const response = await app.inject({
    method: "GET",
    url: "/api/campaigns/2",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), campaign);
  assert.deepEqual(prisma.campaign.findUnique.calls[0]?.[0], { where: { id: 2 } });
});

test("POST /api/campaigns creates a campaign", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    createdBy: 1,
    title: "Clean City Drive",
    description: "Weekend cleanup campaign",
    city: "Bhopal",
    date: "2026-04-20T07:30:00.000Z",
    participantCount: 50,
  };

  const createdCampaign = { id: 5, ...payload };
  prisma.campaign.create.mockResolvedValue(createdCampaign);

  const response = await app.inject({
    method: "POST",
    url: "/api/campaigns",
    headers: createAuthHeaders(app),
    payload,
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), createdCampaign);

  const createArgs = prisma.campaign.create.calls[0]?.[0] as
    | { data: { date: Date } }
    | undefined;

  assert.ok(createArgs);
  assert.ok(createArgs.data.date instanceof Date);
});

test("PUT /api/campaigns/:id updates a campaign", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    title: "Mega Clean City Drive",
    participantCount: 75,
    date: "2026-04-24T07:30:00.000Z",
  };

  const updatedCampaign = {
    id: 7,
    createdBy: 3,
    description: "Expanded citywide campaign",
    city: "Bhopal",
    ...payload,
  };

  prisma.campaign.update.mockResolvedValue(updatedCampaign);

  const response = await app.inject({
    method: "PUT",
    url: "/api/campaigns/7",
    headers: createAuthHeaders(app),
    payload,
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), updatedCampaign);

  const updateArgs = prisma.campaign.update.calls[0]?.[0] as
    | { where: { id: number }; data: { date?: Date } }
    | undefined;

  assert.deepEqual(updateArgs?.where, { id: 7 });
  assert.ok(updateArgs?.data.date instanceof Date);
});

test("DELETE /api/campaigns/:id removes a campaign", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "DELETE",
    url: "/api/campaigns/6",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 204);
  assert.deepEqual(prisma.campaign.delete.calls[0]?.[0], { where: { id: 6 } });
});
