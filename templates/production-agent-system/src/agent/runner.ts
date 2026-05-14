import { runInputGuardrails, runOutputGuardrails } from "../guardrails/guardrails.js";
import { createLifecycleHooks, type LifecycleHooks } from "../runtime/lifecycle-hooks.js";
import type { RunContext } from "../runtime/run-context.js";
import { completeRunState, createInitialRunState, failRunState } from "../runtime/run-state.js";
import { AgentRuntimeError, toStructuredError, type StructuredError } from "../runtime/errors.js";
import { baseSystemInstruction } from "./instructions.js";
import { createAgentRuntime, type AgentRuntime } from "./agent.js";

export type AgentRunInput = {
  message: string;
  metadata?: Record<string, unknown>;
};

export type AgentRunSuccess = {
  runId: string;
  traceId: string;
  status: "completed";
  output: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  toolCalls: unknown[];
};

export type AgentRunFailure = {
  runId: string;
  traceId: string;
  status: "failed";
  error: StructuredError;
};

export type AgentRunResult = AgentRunSuccess | AgentRunFailure;

export type RunAgentOptions = {
  runtime?: AgentRuntime;
  hooks?: LifecycleHooks;
};

export async function runAgent(
  input: AgentRunInput,
  context: RunContext,
  options: RunAgentOptions = {},
): Promise<AgentRunResult> {
  const runtime = options.runtime ?? createAgentRuntime();
  const hooks = options.hooks ?? createLifecycleHooks();
  const state = createInitialRunState(context);
  const startedAtMs = Date.now();
  const span = runtime.tracer.startSpan("agent.run", context, {
    user_id: context.userId,
    thread_id: context.threadId,
  });

  try {
    runtime.logger.info("agent.run.started", { status: "started" }, context);
    await hooks.onRunStarted?.(context);
    const inputGuardrailSpan = runtime.tracer.startSpan("guardrail.input", context, {
      policy_name: "default-input",
    });
    runInputGuardrails(input);
    inputGuardrailSpan.end("completed");

    const llmSpan = runtime.tracer.startSpan("llm.call", context, {
      provider: runtime.provider.name,
      model: runtime.provider.model,
      input_length: input.message.length,
    });
    const response = await runtime.provider.generate({
      input: input.message,
      instructions: baseSystemInstruction,
      availableTools: runtime.tools.list().map((tool) => tool.name),
      metadata: input.metadata,
    });
    llmSpan.end("completed", {
      input_tokens: response.usage.inputTokens,
      output_tokens: response.usage.outputTokens,
    });

    const outputGuardrailSpan = runtime.tracer.startSpan("guardrail.output", context, {
      policy_name: "default-output",
    });
    runOutputGuardrails(response.content);
    outputGuardrailSpan.end("completed");
    completeRunState(state);
    span.end("completed");
    runtime.metrics.observe("agent_run_latency_ms", Date.now() - startedAtMs, { status: "completed" });
    runtime.metrics.observe("llm_token_usage", response.usage.inputTokens + response.usage.outputTokens, {
      provider: runtime.provider.name,
      model: runtime.provider.model,
    });
    runtime.logger.info("agent.run.completed", { status: "completed" }, context);
    await hooks.onRunCompleted?.(context);

    return {
      runId: context.runId,
      traceId: context.traceId,
      status: "completed",
      output: response.content,
      usage: response.usage,
      toolCalls: response.toolCalls,
    };
  } catch (error) {
    const structuredError = toStructuredError(error);
    failRunState(state, structuredError);
    span.end("failed");
    runtime.metrics.observe("agent_run_latency_ms", Date.now() - startedAtMs, { status: "failed" });
    runtime.logger.error("agent.run.failed", { status: "failed", error: structuredError }, context);
    await hooks.onRunFailed?.(context, structuredError);

    return {
      runId: context.runId,
      traceId: context.traceId,
      status: "failed",
      error: structuredError,
    };
  }
}

export function requireMessage(input: AgentRunInput): string {
  if (!input.message.trim()) {
    throw new AgentRuntimeError("EMPTY_INPUT", "Agent input message is required.", "validation");
  }

  return input.message;
}
