import type { StructuredError } from "./errors.js";
import type { RunContext } from "./run-context.js";

export type RunStatus = "created" | "running" | "completed" | "failed";

export type RunState = {
  runId: string;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  error?: StructuredError;
};

export function createInitialRunState(context: RunContext): RunState {
  return {
    runId: context.runId,
    status: "running",
    startedAt: context.startedAt,
  };
}

export function completeRunState(state: RunState): RunState {
  state.status = "completed";
  state.completedAt = new Date().toISOString();
  return state;
}

export function failRunState(state: RunState, error: StructuredError): RunState {
  state.status = "failed";
  state.completedAt = new Date().toISOString();
  state.error = error;
  return state;
}
