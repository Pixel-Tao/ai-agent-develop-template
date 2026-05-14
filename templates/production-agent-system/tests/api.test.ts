import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import test from "node:test";
import { createAgentApiServer } from "../src/api/server.js";
import { readRuntimeEnv } from "../src/config/env.js";

test("GET /healthz returns deployment health metadata", async (t) => {
  const server = createAgentApiServer({
    env: readRuntimeEnv({
      NODE_ENV: "test",
      PORT: "3000",
      LOG_LEVEL: "info",
      MODEL_PROVIDER: "mock",
      MODEL_NAME: "mock-agent",
      SERVICE_VERSION: "test-version",
    }),
  });
  const baseUrl = await listen(server);
  t.after(() => closeServer(server));

  const response = await fetch(`${baseUrl}/healthz`);
  const body = (await response.json()) as { status?: string; version?: string; checks?: unknown[] };

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(body.version, "test-version");
  assert.ok(Array.isArray(body.checks));
});

test("POST /agent/run executes the mock agent path", async (t) => {
  const server = createAgentApiServer();
  const baseUrl = await listen(server);
  t.after(() => closeServer(server));

  const response = await fetch(`${baseUrl}/agent/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: "Summarize deployment status.",
      user_id: "api-user-1",
      thread_id: "api-thread-1",
    }),
  });
  const body = (await response.json()) as { status?: string; output?: string };

  assert.equal(response.status, 200);
  assert.equal(body.status, "completed");
  assert.match(body.output ?? "", /Mock response/);
});

test("POST /agent/run rejects invalid JSON with a structured 400 response", async (t) => {
  const server = createAgentApiServer();
  const baseUrl = await listen(server);
  t.after(() => closeServer(server));

  const response = await fetch(`${baseUrl}/agent/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{not-json",
  });
  const body = (await response.json()) as { error?: string };

  assert.equal(response.status, 400);
  assert.equal(body.error, "invalid_json");
});

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error?: Error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
