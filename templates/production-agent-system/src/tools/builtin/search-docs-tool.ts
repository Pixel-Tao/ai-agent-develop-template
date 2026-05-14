import type { ToolDefinition } from "../tool.js";

export type SearchDocsToolInput = {
  query: string;
};

export type SearchDocsToolOutput = {
  results: Array<{
    path: string;
    snippet: string;
  }>;
};

export const searchDocsTool: ToolDefinition<SearchDocsToolInput, SearchDocsToolOutput> = {
  name: "read_project_docs",
  description: "Reads local project documentation for context.",
  riskLevel: "low",
  inputSchema: {
    type: "object",
    required: ["query"],
    properties: {
      query: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    required: ["results"],
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["path", "snippet"],
          properties: {
            path: { type: "string" },
            snippet: { type: "string" },
          },
        },
      },
    },
  },
  execute(input) {
    return {
      results: [
        {
          path: "README.md",
          snippet: `Search placeholder for query: ${input.query}`,
        },
      ],
    };
  },
};
