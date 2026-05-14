import { echoTool } from "./builtin/echo-tool.js";
import { searchDocsTool } from "./builtin/search-docs-tool.js";
import type { ToolDefinition } from "./tool.js";

export type ToolRegistry = {
  list(): ToolDefinition[];
  get(name: string): ToolDefinition | undefined;
  register(tool: ToolDefinition): void;
};

export function createToolRegistry(initialTools: ToolDefinition[] = defaultTools()): ToolRegistry {
  const tools = new Map<string, ToolDefinition>();
  for (const tool of initialTools) {
    tools.set(tool.name, tool);
  }

  return {
    list() {
      return [...tools.values()].sort((a, b) => a.name.localeCompare(b.name));
    },
    get(name) {
      return tools.get(name);
    },
    register(tool) {
      tools.set(tool.name, tool);
    },
  };
}

export function defaultTools(): ToolDefinition[] {
  return [echoTool, searchDocsTool];
}
