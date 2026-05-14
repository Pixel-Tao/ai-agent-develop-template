import { runAgent } from "./agent/runner.js";
import { createRunContext } from "./runtime/run-context.js";

export { createAgentRuntime } from "./agent/agent.js";
export { runAgent } from "./agent/runner.js";
export type { AgentRunInput, AgentRunResult } from "./agent/runner.js";
export type { ModelProvider, ModelRequest, ModelResponse } from "./agent/model-provider.js";
export { createMockProvider } from "./agent/model-provider.js";
export type { RunContext } from "./runtime/run-context.js";
export { createRunContext } from "./runtime/run-context.js";
export { AgentRuntimeError, toStructuredError } from "./runtime/errors.js";
export { createInMemoryTracer } from "./observability/tracer.js";
export type { InMemoryTracer, TraceEvent, TraceSpan } from "./observability/tracer.js";
export { createInMemoryLogger } from "./observability/logger.js";
export type { Logger, LogEntry } from "./observability/logger.js";
export { createInMemoryMetrics } from "./observability/metrics.js";
export type { Metrics, MetricRecord } from "./observability/metrics.js";
export { createInMemoryAuditLog } from "./observability/audit-log.js";
export type { AuditEvent, AuditLog } from "./observability/audit-log.js";
export { redactText, redactValue } from "./observability/redaction.js";
export { classifyData } from "./security/data-classifier.js";
export type { DataClass, DataClassification } from "./security/data-classifier.js";
export { redactSecretText, redactSecrets } from "./security/secret-redactor.js";
export { checkPromptInjection } from "./security/prompt-injection-check.js";
export type { PromptInjectionResult, SourceTrustLevel } from "./security/prompt-injection-check.js";
export { assertApproved, requiresHumanApproval } from "./security/approval-gate.js";
export type { ApprovalDecision, ApprovalRequest } from "./security/approval-gate.js";
export { assertSecurityPolicyAllowed, evaluateSecurityPolicy } from "./security/policy-engine.js";
export type { SecurityPolicyInput, SecurityPolicyResult } from "./security/policy-engine.js";
export { createInMemoryMemoryStore, scopeFromRunContext } from "./memory/memory-store.js";
export type { MemoryNamespace, MemoryRecord, MemoryScope, MemoryStore } from "./memory/memory-store.js";
export { createInMemoryCheckpointStore } from "./memory/checkpoint-store.js";
export type { AgentCheckpoint, CheckpointStore } from "./memory/checkpoint-store.js";
export { createConversationStore } from "./memory/conversation-store.js";
export type { ConversationMessage, ConversationStore } from "./memory/conversation-store.js";
export { getHealth } from "./api/health.js";
export type { HealthDependency, HealthResponse } from "./api/health.js";
export { createAgentApiServer, startServer } from "./api/server.js";
export { processNextJob, runWorkerLoop, runWorkerOnce, startWorker } from "./workers/agent-worker.js";
export type { WorkerProcessResult } from "./workers/agent-worker.js";
export { createInMemoryAgentQueue } from "./workers/queue.js";
export type { AgentJob, AgentJobQueue, AgentJobStatus, EnqueueAgentJobInput } from "./workers/queue.js";
export { readRuntimeEnv } from "./config/env.js";
export type { RuntimeEnv } from "./config/env.js";

if (process.argv[1]?.endsWith("index.js")) {
  const result = await runAgent(
    { message: "Run the production agent system smoke path." },
    createRunContext({ userId: "local-user", threadId: "local-thread" }),
  );
  console.log(JSON.stringify(result, null, 2));
}
