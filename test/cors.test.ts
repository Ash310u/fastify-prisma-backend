import assert from "node:assert/strict";
import test from "node:test";
import { buildTestApp } from "./helpers/app";

test("allows the frontend origin on normal requests", async (t) => {
  const { app } = await buildTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "GET",
    url: "/health",
    headers: {
      origin: "http://localhost:5173",
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:5173");
  assert.equal(response.headers["vary"], "Origin");
});

test("answers CORS preflight requests for the frontend origin", async (t) => {
  const { app } = await buildTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "OPTIONS",
    url: "/api/users",
    headers: {
      origin: "http://localhost:5173",
      "access-control-request-method": "POST",
      "access-control-request-headers": "authorization,content-type",
    },
  });

  assert.equal(response.statusCode, 204);
  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:5173");
  assert.equal(response.headers["access-control-allow-methods"], "GET,POST,PUT,DELETE,OPTIONS");
  assert.equal(
    response.headers["access-control-allow-headers"],
    "Content-Type, Authorization",
  );
});
