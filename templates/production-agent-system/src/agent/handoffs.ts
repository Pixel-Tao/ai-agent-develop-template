export type HandoffDecision = {
  targetAgent: string | null;
  reason: string;
};

export function resolveHandoff(): HandoffDecision {
  return {
    targetAgent: null,
    reason: "No handoff rules are configured in the runtime skeleton.",
  };
}
