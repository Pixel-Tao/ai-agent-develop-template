import type { RunContext } from "../runtime/run-context.js";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ToolRiskLevel = "low" | "medium" | "high" | "destructive";

export type JsonSchema = {
  type: "object" | "string" | "number" | "integer" | "boolean" | "array";
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
};

export type ToolExecutionContext = {
  runContext?: RunContext;
  signal?: AbortSignal;
};

export type ToolDefinition<TInput extends Record<string, unknown> = Record<string, unknown>, TOutput = unknown> = {
  name: string;
  description: string;
  riskLevel: ToolRiskLevel;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  execute(input: TInput, context: ToolExecutionContext): Promise<TOutput> | TOutput;
};
