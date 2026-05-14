import type { AgentRunInput } from "../agent/runner.js";
import { AgentRuntimeError } from "../runtime/errors.js";
import { checkPromptInjection } from "../security/prompt-injection-check.js";

export function runInputGuardrails(input: AgentRunInput): void {
  if (!input.message.trim()) {
    throw new AgentRuntimeError("EMPTY_INPUT", "Agent input message is required.", "validation");
  }

  const promptInjection = checkPromptInjection(input.message, "untrusted");
  if (promptInjection.action === "block") {
    throw new AgentRuntimeError("PROMPT_INJECTION_BLOCKED", "Prompt injection policy blocked the input.", "security");
  }
}

export function runOutputGuardrails(output: string): void {
  if (!output.trim()) {
    throw new AgentRuntimeError("EMPTY_OUTPUT", "Model provider returned an empty output.", "guardrail");
  }
}
