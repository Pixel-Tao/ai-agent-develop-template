import assert from "node:assert/strict";
import test from "node:test";
import { createAgentRuntime } from "../src/agent/agent.js";
import { runAgent } from "../src/agent/runner.js";
import { createRunContext } from "../src/runtime/run-context.js";
import { createInMemoryTracer } from "../src/observability/tracer.js";
import { createInMemoryLogger } from "../src/observability/logger.js";
import { createInMemoryMetrics } from "../src/observability/metrics.js";
import { createInMemoryAuditLog } from "../src/observability/audit-log.js";
import { redactText } from "../src/observability/redaction.js";
import { runTool } from "../src/tools/tool-runner.js";
import { createInMemoryMemoryStore } from "../src/memory/memory-store.js";

test("agent run emits trace, log, and metric events without exposing raw input", async () => {
  const runtime = createAgentRuntime();
  const context = createRunContext({
    runId: "run-observe-1",
    traceId: "trace-observe-1",
    userId: "user-1",
    threadId: "thread-1",
  });

  const result = await runAgent({ message: "hello sk-secretvalue12345" }, context, { runtime });

  assert.equal(result.status, "completed");
  assert.deepEqual(
    runtime.tracer.events().map((event) => event.name),
    ["agent.run", "guardrail.input", "llm.call", "guardrail.output"],
  );
  assert.equal(JSON.stringify(runtime.tracer.events()).includes("sk-secretvalue12345"), false);
  assert.ok(runtime.logger.entries().some((entry) => entry.event === "agent.run.completed"));
  assert.ok(runtime.metrics.values("agent_run_latency_ms").length >= 1);
  assert.ok(runtime.metrics.values("llm_token_usage").length >= 1);
});

test("tracer and logger redact sensitive attributes by default", () => {
  const tracer = createInMemoryTracer();
  const logger = createInMemoryLogger();
  const context = createRunContext({
    runId: "run-redact-1",
    traceId: "trace-redact-1",
    userId: "user-1",
    threadId: "thread-1",
  });

  const span = tracer.startSpan("llm.call", context, {
    prompt: "token=super-secret-token",
  });
  span.end("completed", {
    api_key: "api_key=secret123",
  });
  logger.info("test.secret", { value: "sk-secretvalue12345" }, context);

  assert.equal(JSON.stringify(tracer.events()).includes("super-secret-token"), false);
  assert.equal(JSON.stringify(logger.entries()).includes("sk-secretvalue12345"), false);
});

test("tool calls emit audit, trace, and metrics events", async () => {
  const context = createRunContext({
    runId: "run-tool-1",
    traceId: "trace-tool-1",
    userId: "user-1",
    threadId: "thread-1",
  });
  const tracer = createInMemoryTracer();
  const metrics = createInMemoryMetrics();
  const auditLog = createInMemoryAuditLog();

  const result = await runTool("echo", { message: "hello" }, {
    runContext: context,
    tracer,
    metrics,
    auditLog,
  });

  assert.equal(result.status, "completed");
  assert.ok(tracer.events().some((event) => event.name === "tool.call" && event.status === "completed"));
  assert.deepEqual(
    auditLog.entries().map((entry) => entry.event),
    ["tool.call.started", "tool.call.completed"],
  );
  assert.ok(metrics.values("tool_call_latency_ms").length >= 1);
});

test("memory writes emit trace and metrics events", async () => {
  const context = createRunContext({
    runId: "run-memory-1",
    traceId: "trace-memory-1",
    userId: "user-1",
    threadId: "thread-1",
  });
  const tracer = createInMemoryTracer();
  const metrics = createInMemoryMetrics();
  const memoryStore = createInMemoryMemoryStore([], { tracer, metrics, runContext: context });

  await memoryStore.write({
    namespace: "thread",
    scope: { userId: "user-1", threadId: "thread-1" },
    key: "summary",
    value: { text: "safe summary" },
    source: "test",
  });

  assert.ok(tracer.events().some((event) => event.name === "memory.write.requested" && event.status === "completed"));
  assert.ok(metrics.values("memory_write_count").some((metric) => metric.tags.policy_result === "allowed"));
});

test("redaction helper removes secret-like strings", () => {
  assert.equal(redactText("sk-secretvalue12345"), "[REDACTED]");
});
