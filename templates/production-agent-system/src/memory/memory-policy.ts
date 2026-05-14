import { redactValue } from "../observability/redaction.js";
import { AgentRuntimeError } from "../runtime/errors.js";
import type { MemoryNamespace, MemoryScope } from "./memory-store.js";

export type DataClass = "public" | "internal" | "pii" | "secret" | "credential" | "financial" | "health" | "source-code";

export type MemoryPolicyDecision = {
  allowed: boolean;
  reason: string;
  dataClasses: DataClass[];
  sanitizedValue: unknown;
};

export type MemoryPolicyOptions = {
  allowSensitiveLongTerm?: boolean;
};

const longTermNamespaces = new Set<MemoryNamespace>(["thread", "user", "project", "audit"]);
const sensitiveLongTermClasses = new Set<DataClass>(["pii", "secret", "credential", "financial", "health"]);

export function evaluateMemoryWrite(
  namespace: MemoryNamespace,
  value: unknown,
  scope: MemoryScope,
  source: string,
  options: MemoryPolicyOptions = {},
): MemoryPolicyDecision {
  if (!source.trim()) {
    return {
      allowed: false,
      reason: "Memory writes require a non-empty source.",
      dataClasses: [],
      sanitizedValue: value,
    };
  }

  validateScope(namespace, scope);

  const dataClasses = classifyMemoryValue(value);
  const containsSensitiveLongTermData = dataClasses.some((dataClass) => sensitiveLongTermClasses.has(dataClass));
  if (longTermNamespaces.has(namespace) && containsSensitiveLongTermData && !options.allowSensitiveLongTerm) {
    return {
      allowed: false,
      reason: `Sensitive data classes are not allowed in long-term ${namespace} memory by default: ${dataClasses.join(", ")}`,
      dataClasses,
      sanitizedValue: redactValue(value),
    };
  }

  return {
    allowed: true,
    reason: "Memory write allowed.",
    dataClasses,
    sanitizedValue: redactValue(value),
  };
}

export function assertMemoryWriteAllowed(decision: MemoryPolicyDecision): void {
  if (!decision.allowed) {
    throw new AgentRuntimeError("MEMORY_POLICY_DENIED", decision.reason, "memory");
  }
}

export function classifyMemoryValue(value: unknown): DataClass[] {
  const text = (JSON.stringify(value) ?? String(value)).toLowerCase();
  const classes = new Set<DataClass>(["internal"]);

  if (/\b[\w.%+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text)) {
    classes.add("pii");
  }
  if (/\bsk-[a-z0-9_-]{8,}\b/i.test(text) || /api[_-]?key|token|password|private key/i.test(text)) {
    classes.add("secret");
    classes.add("credential");
  }
  if (/credit card|card number|bank account|routing number|iban/.test(text)) {
    classes.add("financial");
  }
  if (/diagnosis|patient|medical|health record/.test(text)) {
    classes.add("health");
  }
  if (/function\s+\w+\(|class\s+\w+|import\s+.+from/.test(text)) {
    classes.add("source-code");
  }

  return [...classes].sort();
}

function validateScope(namespace: MemoryNamespace, scope: MemoryScope): void {
  const required = requiredScopeKeys(namespace);
  for (const key of required) {
    if (!scope[key]) {
      throw new AgentRuntimeError("MEMORY_SCOPE_REQUIRED", `${namespace} memory requires scope.${key}.`, "memory");
    }
  }
}

function requiredScopeKeys(namespace: MemoryNamespace): Array<keyof MemoryScope> {
  switch (namespace) {
    case "run":
    case "scratchpad":
      return ["runId"];
    case "thread":
      return ["userId", "threadId"];
    case "user":
      return ["userId"];
    case "project":
      return ["projectId"];
    case "audit":
      return ["runId"];
  }
}
