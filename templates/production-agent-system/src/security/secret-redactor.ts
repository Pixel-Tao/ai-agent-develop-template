import { redactText, redactValue } from "../observability/redaction.js";

export function redactSecretText(value: string): string {
  return redactText(value);
}

export function redactSecrets<T>(value: T): T {
  return redactValue(value);
}
