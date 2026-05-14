import assert from "node:assert/strict";
import test from "node:test";
import { readRuntimeEnv } from "../src/config/env.js";
import { processNextJob } from "../src/workers/agent-worker.js";
import { createInMemoryAgentQueue } from "../src/workers/queue.js";

test("production env validation fails with a clear missing variable error", () => {
  assert.throws(
    () =>
      readRuntimeEnv({
        NODE_ENV: "production",
        PORT: "3000",
        LOG_LEVEL: "info",
        MODEL_PROVIDER: "mock",
      }),
    /Missing required production environment variables: MODEL_NAME, SERVICE_VERSION/,
  );
});

test("external queue mode requires QUEUE_URL", () => {
  assert.throws(
    () =>
      readRuntimeEnv({
        QUEUE_MODE: "external",
      }),
    /QUEUE_MODE=external requires QUEUE_URL/,
  );
});

test("worker processes one queued agent job", async () => {
  const queue = createInMemoryAgentQueue();
  const job = queue.enqueue({
    message: "Process queued deployment job.",
    userId: "worker-user-1",
    threadId: "worker-thread-1",
  });

  const result = await processNextJob(queue);
  const storedJob = queue.get(job.id);

  assert.equal(result.status, "completed");
  assert.equal(storedJob?.status, "completed");
  assert.equal(storedJob?.result?.status, "completed");
});
