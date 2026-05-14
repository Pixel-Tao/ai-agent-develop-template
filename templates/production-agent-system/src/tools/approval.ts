import { AgentRuntimeError } from "../runtime/errors.js";
import type { ToolDefinition, ToolRiskLevel } from "./tool.js";

export type ApprovalDecision = {
  approved: boolean;
  approver?: string;
  reason?: string;
  approvalId?: string;
};

export function requiresApproval(riskLevel: ToolRiskLevel): boolean {
  return riskLevel === "high" || riskLevel === "destructive";
}

export function assertToolApproval(tool: ToolDefinition, approval?: ApprovalDecision): void {
  if (!requiresApproval(tool.riskLevel)) {
    return;
  }

  if (!approval?.approved) {
    throw new AgentRuntimeError(
      "TOOL_APPROVAL_REQUIRED",
      `Tool '${tool.name}' requires human approval before execution.`,
      "tool",
    );
  }
}
