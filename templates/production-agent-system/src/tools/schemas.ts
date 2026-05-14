import { AgentRuntimeError } from "../runtime/errors.js";
import type { JsonSchema } from "./tool.js";

export type SchemaValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateSchema(value: unknown, schema: JsonSchema, path = "$"): SchemaValidationResult {
  const errors: string[] = [];
  validateValue(value, schema, path, errors);
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function assertSchema(value: unknown, schema: JsonSchema, label: string): void {
  const result = validateSchema(value, schema);
  if (!result.valid) {
    throw new AgentRuntimeError("TOOL_SCHEMA_VALIDATION_FAILED", `${label}: ${result.errors.join("; ")}`, "tool");
  }
}

function validateValue(value: unknown, schema: JsonSchema, path: string, errors: string[]): void {
  if (!matchesType(value, schema.type)) {
    errors.push(`${path} expected ${schema.type}`);
    return;
  }

  if (schema.type === "object") {
    const objectValue = value as Record<string, unknown>;
    for (const requiredKey of schema.required ?? []) {
      if (!(requiredKey in objectValue)) {
        errors.push(`${path}.${requiredKey} is required`);
      }
    }

    for (const [key, propertySchema] of Object.entries(schema.properties ?? {})) {
      if (key in objectValue) {
        validateValue(objectValue[key], propertySchema, `${path}.${key}`, errors);
      }
    }
  }

  if (schema.type === "array" && schema.items) {
    (value as unknown[]).forEach((item, index) => {
      validateValue(item, schema.items as JsonSchema, `${path}[${index}]`, errors);
    });
  }
}

function matchesType(value: unknown, type: JsonSchema["type"]): boolean {
  switch (type) {
    case "object":
      return typeof value === "object" && value !== null && !Array.isArray(value);
    case "array":
      return Array.isArray(value);
    case "integer":
      return Number.isInteger(value);
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "string":
      return typeof value === "string";
    case "boolean":
      return typeof value === "boolean";
  }
}
