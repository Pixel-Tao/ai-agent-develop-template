import assert from "node:assert/strict";
import test from "node:test";
import { createInMemoryAuditLog } from "../src/observability/audit-log.js";
import { createToolRegistry } from "../src/tools/tool-registry.js";
import { runTool } from "../src/tools/tool-runner.js";
import type { ToolDefinition } from "../src/tools/tool.js";

test("runs a low-risk built-in tool with schema validation and audit events", async () => {
  const auditLog = createInMemoryAuditLog();
  const result = await runTool("echo", { message: "hello" }, { auditLog });

  assert.equal(result.status, "completed");
  if (result.status === "completed") {
    assert.deepEqual(result.output, { message: "hello" });
  }

  assert.deepEqual(
    auditLog.entries().map((entry) => entry.event),
    ["tool.call.started", "tool.call.completed"],
  );
});

test("rejects invalid tool input before execution", async () => {
  let executed = false;
  const spyTool: ToolDefinition = {
    name: "spy",
    description: "Fails if executed with invalid input.",
    riskLevel: "low",
    inputSchema: {
      type: "object",
      required: ["message"],
      properties: {
        message: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["ok"],
      properties: {
        ok: { type: "boolean" },
      },
    },
    execute() {
      executed = true;
      return { ok: true };
    },
  };

  const registry = createToolRegistry([spyTool]);
  const result = await runTool("spy", {}, { registry });

  assert.equal(result.status, "failed");
  assert.equal(executed, false);
  if (result.status === "failed") {
    assert.equal(result.error.code, "TOOL_SCHEMA_VALIDATION_FAILED");
  }
});

test("blocks destructive tools without approval", async () => {
  let executed = false;
  const destructiveTool: ToolDefinition = {
    name: "delete_everything",
    description: "Test-only destructive tool.",
    riskLevel: "destructive",
    inputSchema: {
      type: "object",
      required: ["target"],
      properties: {
        target: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["deleted"],
      properties: {
        deleted: { type: "boolean" },
      },
    },
    execute() {
      executed = true;
      return { deleted: true };
    },
  };

  const result = await runTool("delete_everything", { target: "production" }, {
    registry: createToolRegistry([destructiveTool]),
  });

  assert.equal(result.status, "failed");
  assert.equal(executed, false);
  if (result.status === "failed") {
    assert.equal(result.error.code, "TOOL_APPROVAL_REQUIRED");
  }
});

test("executes high-risk tools when approval is present", async () => {
  const highRiskTool: ToolDefinition = {
    name: "send_external_message",
    description: "Test-only high-risk tool.",
    riskLevel: "high",
    inputSchema: {
      type: "object",
      required: ["message"],
      properties: {
        message: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["sent"],
      properties: {
        sent: { type: "boolean" },
      },
    },
    execute() {
      return { sent: true };
    },
  };

  const result = await runTool("send_external_message", { message: "approved" }, {
    registry: createToolRegistry([highRiskTool]),
    approval: {
      approved: true,
      approver: "human-operator",
      approvalId: "approval-1",
    },
  });

  assert.equal(result.status, "completed");
});

test("redacts secret-like tool output", async () => {
  const secretTool: ToolDefinition = {
    name: "secret_echo",
    description: "Returns secret-like text for redaction testing.",
    riskLevel: "low",
    inputSchema: {
      type: "object",
      required: ["value"],
      properties: {
        value: { type: "string" },
      },
    },
    outputSchema: {
      type: "object",
      required: ["value"],
      properties: {
        value: { type: "string" },
      },
    },
    execute() {
      return { value: "sk-testsecret12345" };
    },
  };

  const result = await runTool("secret_echo", { value: "ignored" }, {
    registry: createToolRegistry([secretTool]),
  });

  assert.equal(result.status, "completed");
  if (result.status === "completed") {
    assert.deepEqual(result.output, { value: "[REDACTED]" });
  }
});
