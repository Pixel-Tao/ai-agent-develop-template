const secretPatterns = [
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /\b[A-Za-z0-9_-]*token[A-Za-z0-9_-]*\s*[:=]\s*["']?[^"',\s}]+/gi,
  /\b[A-Za-z0-9_-]*api[_-]?key[A-Za-z0-9_-]*\s*[:=]\s*["']?[^"',\s}]+/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
];

export function redactText(value: string): string {
  return secretPatterns.reduce((redacted, pattern) => redacted.replace(pattern, "[REDACTED]"), value);
}

export function redactValue<T>(value: T): T {
  if (typeof value === "string") {
    return redactText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item)) as T;
  }

  if (typeof value === "object" && value !== null) {
    const output: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      output[key] = redactValue(nestedValue);
    }
    return output as T;
  }

  return value;
}
