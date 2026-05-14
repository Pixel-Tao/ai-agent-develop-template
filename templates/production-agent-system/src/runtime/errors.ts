export type ErrorCategory = "validation" | "provider" | "tool" | "guardrail" | "memory" | "security" | "runtime";

export type StructuredError = {
  code: string;
  message: string;
  category: ErrorCategory;
};

export class AgentRuntimeError extends Error {
  readonly code: string;
  readonly category: ErrorCategory;

  constructor(code: string, message: string, category: ErrorCategory = "runtime") {
    super(message);
    this.name = "AgentRuntimeError";
    this.code = code;
    this.category = category;
  }
}

export function toStructuredError(error: unknown): StructuredError {
  if (error instanceof AgentRuntimeError) {
    return {
      code: error.code,
      message: error.message,
      category: error.category,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNHANDLED_RUNTIME_ERROR",
      message: error.message,
      category: "runtime",
    };
  }

  return {
    code: "UNKNOWN_RUNTIME_ERROR",
    message: "Unknown runtime error.",
    category: "runtime",
  };
}
