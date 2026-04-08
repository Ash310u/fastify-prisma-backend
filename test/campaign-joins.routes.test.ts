import assert from "node:assert/strict";
import test from "node:test";
import { buildTestApp, createAuthHeaders } from "./helpers/app";

test("GET /api/campaign-joins returns all campaign joins", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const campaignJoins = [
    {
      id: 1,
      campaignId: 3,
      userId: 4,
    },
  ];

  prisma.campaignJoin.findMany.mockResolvedValue(campaignJoins);

  const response = await app.inject({
    method: "GET",
    url: "/api/campaign-joins",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), campaignJoins);
  assert.equal(prisma.campaignJoin.findMany.calls.length, 1);
});

test("GET /api/campaign-joins/:id returns one campaign join", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const campaignJoin = {
    id: 2,
    campaignId: 7,
    userId: 8,
  };

  prisma.campaignJoin.findUnique.mockResolvedValue(campaignJoin);

  const response = await app.inject({
    method: "GET",
    url: "/api/campaign-joins/2",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), campaignJoin);
  assert.deepEqual(prisma.campaignJoin.findUnique.calls[0]?.[0], { where: { id: 2 } });
});

test("POST /api/campaign-joins creates a campaign join", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    campaignId: 2,
    userId: 3,
  };

  const createdCampaignJoin = { id: 4, ...payload };
  prisma.campaignJoin.create.mockResolvedValue(createdCampaignJoin);

  const response = await app.inject({
    method: "POST",
    url: "/api/campaign-joins",
    headers: createAuthHeaders(app),
    payload,
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), createdCampaignJoin);
  assert.deepEqual(prisma.campaignJoin.create.calls[0]?.[0], { data: payload });
});

test("PUT /api/campaign-joins/:id updates a campaign join", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    campaignId: 5,
    userId: 6,
  };

  const updatedCampaignJoin = { id: 9, ...payload };
  prisma.campaignJoin.update.mockResolvedValue(updatedCampaignJoin);

  const response = await app.inject({
    method: "PUT",
    url: "/api/campaign-joins/9",
    headers: createAuthHeaders(app),
    payload,
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), updatedCampaignJoin);
  assert.deepEqual(prisma.campaignJoin.update.calls[0]?.[0], {
    where: { id: 9 },
    data: payload,
  });
});

test("DELETE /api/campaign-joins/:id removes a campaign join", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "DELETE",
    url: "/api/campaign-joins/12",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 204);
  assert.deepEqual(prisma.campaignJoin.delete.calls[0]?.[0], { where: { id: 12 } });
});
