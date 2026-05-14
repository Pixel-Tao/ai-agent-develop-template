export type SourceTrustLevel = "trusted" | "internal" | "external" | "untrusted";

export type PromptInjectionFinding = {
  pattern: string;
  severity: "low" | "medium" | "high";
  message: string;
};

export type PromptInjectionResult = {
  detected: boolean;
  action: "allow" | "downgrade" | "block";
  sourceTrustLevel: SourceTrustLevel;
  findings: PromptInjectionFinding[];
};

const rules: Array<{ pattern: RegExp; label: string; severity: PromptInjectionFinding["severity"]; message: string }> = [
  {
    pattern: /ignore (all )?(previous|prior|system|developer) instructions/i,
    label: "ignore-instructions",
    severity: "high",
    message: "Attempts to override higher-priority instructions.",
  },
  {
    pattern: /(reveal|print|show).{0,40}(system prompt|developer message|hidden instructions)/i,
    label: "reveal-hidden-instructions",
    severity: "high",
    message: "Attempts to reveal hidden instructions.",
  },
  {
    pattern: /(exfiltrate|send|upload).{0,40}(secret|token|api key|credential)/i,
    label: "exfiltrate-secrets",
    severity: "high",
    message: "Attempts to exfiltrate secrets.",
  },
  {
    pattern: /(disable|bypass).{0,40}(safety|guardrail|approval)/i,
    label: "bypass-safety",
    severity: "medium",
    message: "Attempts to bypass safety controls.",
  },
];

export function checkPromptInjection(input: string, sourceTrustLevel: SourceTrustLevel = "untrusted"): PromptInjectionResult {
  const findings = rules
    .filter((rule) => rule.pattern.test(input))
    .map((rule) => ({
      pattern: rule.label,
      severity: rule.severity,
      message: rule.message,
    }));

  const hasHigh = findings.some((finding) => finding.severity === "high");
  const detected = findings.length > 0;
  const action = !detected
    ? "allow"
    : hasHigh || sourceTrustLevel === "untrusted"
      ? "block"
      : "downgrade";

  return {
    detected,
    action,
    sourceTrustLevel,
    findings,
  };
}
