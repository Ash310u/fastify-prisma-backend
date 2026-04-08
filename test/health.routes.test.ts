import assert from "node:assert/strict";
import test from "node:test";
import { buildTestApp } from "./helpers/app";

test("GET /health returns ok status", async (t) => {
  const { app } = await buildTestApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "GET",
    url: "/health",
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
});
