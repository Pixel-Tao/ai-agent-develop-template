import { createInMemoryAuditLog, type AuditLog } from "../observability/audit-log.js";
import { AgentRuntimeError } from "../runtime/errors.js";
import type { ToolRiskLevel } from "../tools/tool.js";
import { assertApproved, type ApprovalDecision } from "./approval-gate.js";
import { classifyData, type DataClassification } from "./data-classifier.js";
import { checkPromptInjection, type PromptInjectionResult, type SourceTrustLevel } from "./prompt-injection-check.js";
import { redactSecrets } from "./secret-redactor.js";

export type SecurityPolicyInput = {
  action: string;
  riskLevel?: ToolRiskLevel;
  input?: unknown;
  sourceTrustLevel?: SourceTrustLevel;
  approval?: ApprovalDecision;
  allowSensitiveData?: boolean;
  auditLog?: AuditLog;
};

export type SecurityPolicyResult = {
  allowed: boolean;
  action: "allow" | "downgrade" | "block";
  reason: string;
  classification: DataClassification;
  promptInjection: PromptInjectionResult;
  sanitizedInput: unknown;
};

export function evaluateSecurityPolicy(input: SecurityPolicyInput): SecurityPolicyResult {
  const classification = classifyData(input.input ?? "");
  const promptInjection = checkPromptInjection(String(input.input ?? ""), input.sourceTrustLevel ?? "untrusted");
  const sanitizedInput = redactSecrets(input.input);

  if (promptInjection.action === "block") {
    return {
      allowed: false,
      action: "block",
      reason: "Prompt injection policy blocked the input.",
      classification,
      promptInjection,
      sanitizedInput,
    };
  }

  if (classification.sensitive && !input.allowSensitiveData) {
    return {
      allowed: false,
      action: "block",
      reason: `Sensitive data requires explicit opt-in: ${classification.classes.join(", ")}`,
      classification,
      promptInjection,
      sanitizedInput,
    };
  }

  return {
    allowed: true,
    action: promptInjection.action,
    reason: promptInjection.action === "downgrade" ? "Suspicious input downgraded." : "Security policy allowed the action.",
    classification,
    promptInjection,
    sanitizedInput,
  };
}

export function assertSecurityPolicyAllowed(input: SecurityPolicyInput): SecurityPolicyResult {
  const auditLog = input.auditLog ?? createInMemoryAuditLog();
  const result = evaluateSecurityPolicy(input);
  auditLog.record({
    event: result.allowed ? "security.policy.allowed" : "security.policy.blocked",
    riskLevel: input.riskLevel,
    status: result.allowed ? "completed" : "failed",
    details: {
      action: input.action,
      policy_action: result.action,
      reason: result.reason,
      data_classes: result.classification.classes,
      prompt_injection_findings: result.promptInjection.findings,
    },
  });

  if (!result.allowed) {
    throw new AgentRuntimeError("SECURITY_POLICY_DENIED", result.reason, "security");
  }

  if (input.riskLevel) {
    assertApproved(
      {
        action: input.action,
        riskLevel: input.riskLevel,
      },
      input.approval,
      auditLog,
    );
  }

  return result;
}
