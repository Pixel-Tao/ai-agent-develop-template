export type ModelRequest = {
  input: string;
  instructions: string;
  availableTools: string[];
  metadata?: Record<string, unknown>;
};

export type ModelResponse = {
  content: string;
  toolCalls: Array<{
    name: string;
    input: Record<string, unknown>;
  }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
};

export type ModelProvider = {
  name: string;
  model: string;
  generate(request: ModelRequest): Promise<ModelResponse>;
  stream?(request: ModelRequest): AsyncIterable<ModelResponse>;
};

export function createMockProvider(model = "mock-agent"): ModelProvider {
  return {
    name: "mock",
    model,
    async generate(request) {
      return {
        content: `Mock response for: ${request.input}`,
        toolCalls: [],
        usage: {
          inputTokens: countTokens(request.instructions) + countTokens(request.input),
          outputTokens: countTokens(request.input) + 3,
        },
      };
    },
  };
}

function countTokens(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
