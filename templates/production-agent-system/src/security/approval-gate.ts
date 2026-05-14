import { createInMemoryAuditLog, type AuditLog } from "../observability/audit-log.js";
import { AgentRuntimeError } from "../runtime/errors.js";
import type { ToolRiskLevel } from "../tools/tool.js";

export type ApprovalDecision = {
  approved: boolean;
  approver?: string;
  reason?: string;
  approvalId?: string;
};

export type ApprovalRequest = {
  action: string;
  riskLevel: ToolRiskLevel;
  requester?: string;
  approverRole?: string;
};

export function requiresHumanApproval(riskLevel: ToolRiskLevel): boolean {
  return riskLevel === "high" || riskLevel === "destructive";
}

export function assertApproved(
  request: ApprovalRequest,
  decision?: ApprovalDecision,
  auditLog: AuditLog = createInMemoryAuditLog(),
): void {
  if (!requiresHumanApproval(request.riskLevel)) {
    return;
  }

  auditLog.record({
    event: "approval.requested",
    riskLevel: request.riskLevel,
    status: decision?.approved ? "completed" : "failed",
    details: {
      action: request.action,
      requester: request.requester,
      approver_role: request.approverRole ?? "human-operator",
      approval_id: decision?.approvalId,
      approver: decision?.approver,
    },
  });

  if (!decision?.approved) {
    throw new AgentRuntimeError(
      "SECURITY_APPROVAL_REQUIRED",
      `Action '${request.action}' requires human approval.`,
      "security",
    );
  }
}
