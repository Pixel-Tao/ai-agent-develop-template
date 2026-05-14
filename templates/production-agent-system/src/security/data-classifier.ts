export type DataClass =
  | "public"
  | "internal"
  | "source-code"
  | "pii"
  | "secret"
  | "credential"
  | "financial"
  | "health";

export type DataClassification = {
  classes: DataClass[];
  sensitive: boolean;
  reasons: string[];
};

const sensitiveClasses = new Set<DataClass>(["pii", "secret", "credential", "financial", "health"]);

export function classifyData(value: unknown): DataClassification {
  const text = stringify(value);
  const lower = text.toLowerCase();
  const classes = new Set<DataClass>(["internal"]);
  const reasons: string[] = [];

  if (/\b[\w.%+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text)) {
    classes.add("pii");
    reasons.push("email-like identifier detected");
  }
  if (/\bsk-[A-Za-z0-9_-]{8,}\b/.test(text) || /api[_-]?key|token|password|private key/i.test(text)) {
    classes.add("secret");
    classes.add("credential");
    reasons.push("secret-like credential detected");
  }
  if (/credit card|card number|bank account|routing number|iban/i.test(text)) {
    classes.add("financial");
    reasons.push("financial data indicator detected");
  }
  if (/diagnosis|patient|medical|health record/i.test(text)) {
    classes.add("health");
    reasons.push("health data indicator detected");
  }
  if (/function\s+\w+\(|class\s+\w+|import\s+.+from/.test(text)) {
    classes.add("source-code");
    reasons.push("source-code pattern detected");
  }
  if (/public information|public docs/i.test(lower)) {
    classes.add("public");
    classes.delete("internal");
  }

  const sortedClasses = [...classes].sort();
  return {
    classes: sortedClasses,
    sensitive: sortedClasses.some((dataClass) => sensitiveClasses.has(dataClass)),
    reasons,
  };
}

function stringify(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value) ?? String(value);
}
