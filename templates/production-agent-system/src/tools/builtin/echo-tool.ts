import type { ToolDefinition } from "../tool.js";

export type EchoToolInput = {
  message: string;
};

export type EchoToolOutput = {
  message: string;
};

export const echoTool: ToolDefinition<EchoToolInput, EchoToolOutput> = {
  name: "echo",
  description: "Returns the provided input for runtime smoke testing.",
  riskLevel: "low",
  inputSchema: {
    type: "object",
    required: ["message"],
    properties: {
      message: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    required: ["message"],
    properties: {
      message: { type: "string" },
    },
  },
  execute(input) {
    return {
      message: input.message,
    };
  },
};
