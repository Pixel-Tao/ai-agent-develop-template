import { createInMemoryAuditLog, type AuditLog } from "../observability/audit-log.js";
import type { Logger } from "../observability/logger.js";
import type { Metrics } from "../observability/metrics.js";
import { redactValue } from "../observability/redaction.js";
import type { InMemoryTracer } from "../observability/tracer.js";
import { AgentRuntimeError, toStructuredError, type StructuredError } from "../runtime/errors.js";
import type { RunContext } from "../runtime/run-context.js";
import { assertToolApproval, requiresApproval, type ApprovalDecision } from "./approval.js";
import { assertSchema } from "./schemas.js";
import type { ToolDefinition } from "./tool.js";
import { createToolRegistry, type ToolRegistry } from "./tool-registry.js";

export type ToolRunOptions = {
  registry?: ToolRegistry;
  runContext?: RunContext;
  approval?: ApprovalDecision;
  auditLog?: AuditLog;
  tracer?: InMemoryTracer;
  logger?: Logger;
  metrics?: Metrics;
  timeoutMs?: number;
  retryCount?: number;
  redactOutput?: boolean;
};

export type ToolRunSuccess = {
  status: "completed";
  toolName: string;
  output: unknown;
};

export type ToolRunFailure = {
  status: "failed";
  toolName: string;
  error: StructuredError;
};

export type ToolRunResult = ToolRunSuccess | ToolRunFailure;

export async function runTool(
  toolName: string,
  input: Record<string, unknown>,
  options: ToolRunOptions = {},
): Promise<ToolRunResult> {
  const registry = options.registry ?? createToolRegistry();
  const auditLog = options.auditLog ?? createInMemoryAuditLog();
  const tool = registry.get(toolName);
  const startedAtMs = Date.now();

  if (!tool) {
    options.metrics?.increment("tool_failure_count", 1, { reason: "not_found" });
    return {
      status: "failed",
      toolName,
      error: toStructuredError(new AgentRuntimeError("TOOL_NOT_FOUND", `Tool '${toolName}' is not registered.`, "tool")),
    };
  }

  auditLog.record({
    event: "tool.call.started",
    toolName: tool.name,
    riskLevel: tool.riskLevel,
    runId: options.runContext?.runId,
    traceId: options.runContext?.traceId,
    status: "started",
  });
  const span = options.tracer?.startSpan("tool.call", options.runContext ?? fallbackRunContext(), {
    tool_name: tool.name,
    risk_level: tool.riskLevel,
    approval_required: requiresApproval(tool.riskLevel),
  });
  options.logger?.info("tool.call.started", {
    tool_name: tool.name,
    risk_level: tool.riskLevel,
    approval_required: requiresApproval(tool.riskLevel),
  }, options.runContext);

  try {
    assertSchema(input, tool.inputSchema, `Tool '${tool.name}' input`);
    if (requiresApproval(tool.riskLevel)) {
      auditLog.record({
        event: "approval.requested",
        toolName: tool.name,
        riskLevel: tool.riskLevel,
        runId: options.runContext?.runId,
        traceId: options.runContext?.traceId,
        status: options.approval?.approved ? "completed" : "failed",
      });
      const approvalSpan = options.tracer?.startSpan("approval.requested", options.runContext ?? fallbackRunContext(), {
        tool_name: tool.name,
        risk_level: tool.riskLevel,
      });
      approvalSpan?.end(options.approval?.approved ? "completed" : "failed");
      options.metrics?.increment("approval_request_count", 1, { risk_level: tool.riskLevel });
    }
    assertToolApproval(tool, options.approval);
    const rawOutput = await runWithRetry(tool, input, options);
    assertSchema(rawOutput, tool.outputSchema, `Tool '${tool.name}' output`);
    const output = options.redactOutput === false ? rawOutput : redactValue(rawOutput);

    auditLog.record({
      event: "tool.call.completed",
      toolName: tool.name,
      riskLevel: tool.riskLevel,
      runId: options.runContext?.runId,
      traceId: options.runContext?.traceId,
      status: "completed",
    });
    span?.end("completed", {
      latency_ms: Date.now() - startedAtMs,
    });
    options.metrics?.observe("tool_call_latency_ms", Date.now() - startedAtMs, {
      tool_name: tool.name,
      status: "completed",
    });
    options.logger?.info("tool.call.completed", {
      tool_name: tool.name,
      status: "completed",
    }, options.runContext);

    return {
      status: "completed",
      toolName: tool.name,
      output,
    };
  } catch (error) {
    const structuredError = toStructuredError(error);
    auditLog.record({
      event: "tool.call.failed",
      toolName: tool.name,
      riskLevel: tool.riskLevel,
      runId: options.runContext?.runId,
      traceId: options.runContext?.traceId,
      status: "failed",
      details: {
        code: structuredError.code,
        category: structuredError.category,
      },
    });
    span?.end("failed", {
      latency_ms: Date.now() - startedAtMs,
      error_code: structuredError.code,
    });
    options.metrics?.increment("tool_failure_count", 1, {
      tool_name: tool.name,
      code: structuredError.code,
    });
    options.metrics?.observe("tool_call_latency_ms", Date.now() - startedAtMs, {
      tool_name: tool.name,
      status: "failed",
    });
    options.logger?.error("tool.call.failed", {
      tool_name: tool.name,
      error: structuredError,
    }, options.runContext);

    return {
      status: "failed",
      toolName: tool.name,
      error: structuredError,
    };
  }
}

function fallbackRunContext(): RunContext {
  return {
    runId: "run_unscoped",
    traceId: "trace_unscoped",
    userId: "unknown-user",
    threadId: "unknown-thread",
    startedAt: new Date().toISOString(),
  };
}

async function runWithRetry(
  tool: ToolDefinition,
  input: Record<string, unknown>,
  options: ToolRunOptions,
): Promise<unknown> {
  const retryCount = options.retryCount ?? 0;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      return await runWithTimeout(tool, input, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function runWithTimeout(
  tool: ToolDefinition,
  input: Record<string, unknown>,
  options: ToolRunOptions,
): Promise<unknown> {
  const timeoutMs = options.timeoutMs ?? 30000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await Promise.race([
      Promise.resolve(tool.execute(input, { runContext: options.runContext, signal: controller.signal })),
      new Promise((_, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new AgentRuntimeError("TOOL_TIMEOUT", `Tool '${tool.name}' timed out.`, "tool"));
        });
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
