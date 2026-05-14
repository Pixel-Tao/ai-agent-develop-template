import type { StructuredError } from "./errors.js";
import type { RunContext } from "./run-context.js";

export type LifecycleHooks = {
  onRunStarted?: (context: RunContext) => Promise<void> | void;
  onRunCompleted?: (context: RunContext) => Promise<void> | void;
  onRunFailed?: (context: RunContext, error: StructuredError) => Promise<void> | void;
};

export function createLifecycleHooks(overrides: LifecycleHooks = {}): LifecycleHooks {
  return {
    onRunStarted: overrides.onRunStarted,
    onRunCompleted: overrides.onRunCompleted,
    onRunFailed: overrides.onRunFailed,
  };
}
