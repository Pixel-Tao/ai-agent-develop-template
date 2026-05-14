import assert from "node:assert/strict";
import test from "node:test";
import { createRunContext, runAgent } from "../src/index.js";

test("runAgent completes with the mock provider without an API key", async () => {
  const context = createRunContext({
    userId: "user-1",
    threadId: "thread-1",
    projectId: "project-1",
  });

  const result = await runAgent({ message: "Summarize this project." }, context);

  assert.equal(result.status, "completed");
  assert.equal(result.runId, context.runId);
  assert.equal(result.traceId, context.traceId);

  if (result.status === "completed") {
    assert.match(result.output, /Mock response/);
    assert.equal(result.toolCalls.length, 0);
    assert.ok(result.usage.inputTokens > 0);
  }
});

test("runAgent returns a structured error for invalid input", async () => {
  const context = createRunContext({
    userId: "user-1",
    threadId: "thread-1",
  });

  const result = await runAgent({ message: "   " }, context);

  assert.equal(result.status, "failed");
  if (result.status === "failed") {
    assert.equal(result.error.code, "EMPTY_INPUT");
    assert.equal(result.error.category, "validation");
  }
});
