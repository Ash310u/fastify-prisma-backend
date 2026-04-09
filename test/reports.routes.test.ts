import assert from "node:assert/strict";
import test from "node:test";
import { UserRole } from "../generated/prisma/client";
import { setGeminiAnalyzerForTests } from "../src/services/geminiVision";
import { buildTestApp, createAuthHeaders } from "./helpers/app";

test("GET /api/reports returns all reports", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const reports = [
    {
      id: 1,
      userId: 1,
      imageUrl: "https://example.com/report.jpg",
      addressText: "Near City Park",
      description: "Garbage pile near the footpath",
      category: "plastic",
      severity: "high",
      status: "pending",
      aiConfidenceScore: 0.91,
    },
  ];

  prisma.report.findMany.mockResolvedValue(reports);

  const response = await app.inject({
    method: "GET",
    url: "/api/reports",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), reports);
  assert.equal(prisma.report.findMany.calls.length, 1);
});

test("GET /api/reports/:id returns one report", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const report = {
    id: 2,
    userId: 4,
    imageUrl: "https://example.com/report-2.jpg",
    addressText: "Market Road",
    description: "Overflowing bin near market gate",
    category: "mixed",
    severity: "medium",
    status: "assigned",
    aiConfidenceScore: 0.87,
  };

  prisma.report.findUnique.mockResolvedValue(report);

  const response = await app.inject({
    method: "GET",
    url: "/api/reports/2",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), report);
  assert.deepEqual(prisma.report.findUnique.calls[0]?.[0], {
    where: { id: 2 },
  });
});

test("POST /api/reports creates a report", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => {
    setGeminiAnalyzerForTests(null);
    return app.close();
  });

  const payload = {
    imageUrl: "https://example.com/report.jpg",
    lat: 23.2599,
    lng: 77.4126,
    addressText: "Near City Park",
  };

  setGeminiAnalyzerForTests(async () => ({
    isGarbage: true,
    category: "plastic",
    severity: "HIGH",
    confidence: 0.91,
    reason: "Large mixed garbage pile on footpath",
  }));

  const createdReport = {
    id: 11,
    userId: 7,
    imageUrl: payload.imageUrl,
    addressText: payload.addressText,
    description: "Large mixed garbage pile on footpath",
    category: "plastic",
    severity: "HIGH",
    status: "pending",
    aiConfidenceScore: 0.91,
    resolvedAt: null,
  };

  prisma.$queryRaw.mockResolvedValue([{ id: 11 }]);
  prisma.report.findUnique.mockResolvedValue(createdReport);

  const response = await app.inject({
    method: "POST",
    url: "/api/reports",
    headers: createAuthHeaders(app, {
      userId: 7,
      role: UserRole.citizen,
      email: "citizen@example.com",
    }),
    payload,
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.json(), createdReport);
  assert.deepEqual(prisma.report.findUnique.calls[0]?.[0], {
    where: { id: 11 },
  });

  const queryArgs = prisma.$queryRaw.calls[0] ?? [];
  assert.equal(queryArgs[1], 7);
  assert.equal(queryArgs[2], payload.imageUrl);
  assert.equal(queryArgs[3], payload.lng);
  assert.equal(queryArgs[4], payload.lat);
  assert.equal(queryArgs[7], "plastic");
  assert.equal(queryArgs[8], "HIGH");
  assert.equal(queryArgs[10], 0.91);
  assert.equal(queryArgs[11], null);
});

test("POST /api/reports accepts latitude/longitude alias fields", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => {
    setGeminiAnalyzerForTests(null);
    return app.close();
  });

  setGeminiAnalyzerForTests(async () => ({
    isGarbage: true,
    category: "mixed",
    severity: "MEDIUM",
    confidence: 0.72,
    reason: "Moderate roadside accumulation",
  }));

  prisma.$queryRaw.mockResolvedValue([{ id: 21 }]);
  prisma.report.findUnique.mockResolvedValue({ id: 21 });

  const response = await app.inject({
    method: "POST",
    url: "/api/reports",
    headers: createAuthHeaders(app, {
      userId: 12,
      role: UserRole.citizen,
      email: "citizen@example.com",
    }),
    payload: {
      imageUrl: "https://example.com/report-alias.jpg",
      addressText: "Main Road",
      latitude: "23.2599",
      longitude: "77.4126",
    },
  });

  assert.equal(response.statusCode, 201);

  const queryArgs = prisma.$queryRaw.calls[0] ?? [];
  assert.equal(queryArgs[1], 12);
  assert.equal(queryArgs[3], 77.4126);
  assert.equal(queryArgs[4], 23.2599);
});

test("POST /api/reports returns 400 when AI detects no garbage", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => {
    setGeminiAnalyzerForTests(null);
    return app.close();
  });

  setGeminiAnalyzerForTests(async () => ({
    isGarbage: false,
    category: null,
    severity: null,
    confidence: 0,
    reason: "No visible waste",
  }));

  const response = await app.inject({
    method: "POST",
    url: "/api/reports",
    headers: createAuthHeaders(app, {
      role: UserRole.citizen,
      email: "citizen@example.com",
    }),
    payload: {
      imageUrl: "https://example.com/clean-street.jpg",
      addressText: "Clean Street",
      lat: 23.11,
      lng: 77.21,
    },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { message: "No garbage detected in image" });
  assert.equal(prisma.$queryRaw.calls.length, 0);
});

test("POST /api/reports returns 403 for non-citizen users", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => {
    setGeminiAnalyzerForTests(null);
    return app.close();
  });

  const response = await app.inject({
    method: "POST",
    url: "/api/reports",
    headers: createAuthHeaders(app, {
      role: UserRole.admin,
      email: "admin@example.com",
    }),
    payload: {
      imageUrl: "https://example.com/report.jpg",
      addressText: "Near City Park",
      lat: 23.2599,
      lng: 77.4126,
    },
  });

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.json(), { message: "Only citizen users can create reports" });
  assert.equal(prisma.$queryRaw.calls.length, 0);
});

test("PUT /api/reports/:id updates a report", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const payload = {
    status: "resolved",
    severity: "low",
    aiConfidenceScore: 0.94,
    resolvedAt: "2026-04-09T09:30:00.000Z",
  };

  const updatedReport = {
    id: 5,
    userId: 2,
    imageUrl: "https://example.com/updated-report.jpg",
    addressText: "Station Road",
    description: "Waste near bus station",
    category: "organic",
    ...payload,
  };

  prisma.$queryRaw.mockResolvedValue([{ id: 5 }]);
  prisma.report.findUnique.mockResolvedValue(updatedReport);

  const response = await app.inject({
    method: "PUT",
    url: "/api/reports/5",
    headers: createAuthHeaders(app),
    payload,
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), updatedReport);
  assert.deepEqual(prisma.report.findUnique.calls[0]?.[0], {
    where: { id: 5 },
  });

  const queryArgs = prisma.$queryRaw.calls[0] ?? [];
  assert.equal(queryArgs[13], true);
  assert.equal(queryArgs[14], false);
  assert.ok(queryArgs[15] instanceof Date);
  assert.equal(queryArgs[16], 5);
});

test("DELETE /api/reports/:id removes a report", async (t) => {
  const { app, prisma } = await buildTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "DELETE",
    url: "/api/reports/8",
    headers: createAuthHeaders(app),
  });

  assert.equal(response.statusCode, 204);

  const queryArgs = prisma.$executeRaw.calls[0] ?? [];
  assert.equal(queryArgs[1], 8);
});
