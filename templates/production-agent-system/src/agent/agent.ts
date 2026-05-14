import { createInMemoryAuditLog } from "../observability/audit-log.js";
import { createInMemoryLogger } from "../observability/logger.js";
import { createInMemoryMetrics } from "../observability/metrics.js";
import { readRuntimeEnv } from "../config/env.js";
import { createModelConfig } from "../config/model-config.js";
import { createInMemoryTracer } from "../observability/tracer.js";
import { createToolRegistry } from "../tools/tool-registry.js";
import { createMockProvider, type ModelProvider } from "./model-provider.js";

export type AgentRuntime = {
  provider: ModelProvider;
  tracer: ReturnType<typeof createInMemoryTracer>;
  logger: ReturnType<typeof createInMemoryLogger>;
  metrics: ReturnType<typeof createInMemoryMetrics>;
  auditLog: ReturnType<typeof createInMemoryAuditLog>;
  tools: ReturnType<typeof createToolRegistry>;
};

export function createAgentRuntime(): AgentRuntime {
  const env = readRuntimeEnv();
  const modelConfig = createModelConfig(env);

  return {
    provider: createMockProvider(modelConfig.model),
    tracer: createInMemoryTracer(),
    logger: createInMemoryLogger(),
    metrics: createInMemoryMetrics(),
    auditLog: createInMemoryAuditLog(),
    tools: createToolRegistry(),
  };
}
