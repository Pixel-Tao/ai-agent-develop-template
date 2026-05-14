import { randomUUID } from "node:crypto";
import type { Metrics } from "../observability/metrics.js";
import type { InMemoryTracer } from "../observability/tracer.js";
import type { RunContext } from "../runtime/run-context.js";
import { assertMemoryWriteAllowed, evaluateMemoryWrite, type DataClass, type MemoryPolicyOptions } from "./memory-policy.js";

export type MemoryNamespace = "run" | "thread" | "user" | "project" | "scratchpad" | "audit";

export type MemoryScope = {
  runId?: string;
  userId?: string;
  threadId?: string;
  projectId?: string;
};

export type MemoryRecord = {
  id: string;
  namespace: MemoryNamespace;
  scopeKey: string;
  key: string;
  value: unknown;
  source: string;
  dataClasses: DataClass[];
  createdAt: string;
  updatedAt: string;
};

export type MemoryWrite = {
  namespace: MemoryNamespace;
  scope: MemoryScope;
  key: string;
  value: unknown;
  source: string;
  policy?: MemoryPolicyOptions;
};

export type MemoryQuery = {
  namespace: MemoryNamespace;
  scope: MemoryScope;
  key?: string;
};

export type MemoryStore = {
  write(input: MemoryWrite): Promise<MemoryRecord>;
  read(query: MemoryQuery): Promise<MemoryRecord | undefined>;
  list(query: MemoryQuery): Promise<MemoryRecord[]>;
  delete(query: MemoryQuery): Promise<number>;
};

export type ProductionMemoryAdapter = MemoryStore;

export type MemoryStoreObservability = {
  tracer?: InMemoryTracer;
  metrics?: Metrics;
  runContext?: RunContext;
};

export function createInMemoryMemoryStore(seed: MemoryRecord[] = [], observability: MemoryStoreObservability = {}): MemoryStore {
  const records = new Map(seed.map((record) => [recordKey(record.namespace, record.scopeKey, record.key), record]));

  return {
    async write(input) {
      const span = observability.tracer?.startSpan("memory.write.requested", observability.runContext ?? fallbackRunContext(), {
        namespace: input.namespace,
        key: input.key,
      });
      try {
        const policyDecision = evaluateMemoryWrite(input.namespace, input.value, input.scope, input.source, input.policy);
        assertMemoryWriteAllowed(policyDecision);

        const now = new Date().toISOString();
        const scopeKey = createScopeKey(input.namespace, input.scope);
        const key = recordKey(input.namespace, scopeKey, input.key);
        const previous = records.get(key);
        const record: MemoryRecord = {
          id: previous?.id ?? `mem_${randomUUID()}`,
          namespace: input.namespace,
          scopeKey,
          key: input.key,
          value: policyDecision.sanitizedValue,
          source: input.source,
          dataClasses: policyDecision.dataClasses,
          createdAt: previous?.createdAt ?? now,
          updatedAt: now,
        };

        records.set(key, record);
        span?.end("completed", {
          policy_result: "allowed",
          data_classes: policyDecision.dataClasses,
        });
        observability.metrics?.increment("memory_write_count", 1, {
          namespace: input.namespace,
          policy_result: "allowed",
        });
        return record;
      } catch (error) {
        span?.end("failed", {
          policy_result: "denied",
        });
        observability.metrics?.increment("memory_write_count", 1, {
          namespace: input.namespace,
          policy_result: "denied",
        });
        throw error;
      }
    },
    async read(query) {
      const span = observability.tracer?.startSpan("memory.read", observability.runContext ?? fallbackRunContext(), {
        namespace: query.namespace,
        key: query.key,
      });
      const scopeKey = createScopeKey(query.namespace, query.scope);
      if (!query.key) {
        span?.end("completed", { hit: false });
        return undefined;
      }

      const record = records.get(recordKey(query.namespace, scopeKey, query.key));
      span?.end("completed", { hit: Boolean(record) });
      return record;
    },
    async list(query) {
      const scopeKey = createScopeKey(query.namespace, query.scope);
      return [...records.values()]
        .filter((record) => record.namespace === query.namespace && record.scopeKey === scopeKey)
        .filter((record) => (query.key ? record.key === query.key : true))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async delete(query) {
      const matches = await this.list(query);
      for (const record of matches) {
        records.delete(recordKey(record.namespace, record.scopeKey, record.key));
      }
      return matches.length;
    },
  };
}

function fallbackRunContext(): RunContext {
  return {
    runId: "run_unscoped",
    traceId: "trace_unscoped",
    userId: "unknown-user",
    threadId: "unknown-thread",
    startedAt: new Date().toISOString(),
  };
}

export function scopeFromRunContext(context: RunContext): MemoryScope {
  return {
    runId: context.runId,
    userId: context.userId,
    threadId: context.threadId,
    projectId: context.projectId,
  };
}

export function createScopeKey(namespace: MemoryNamespace, scope: MemoryScope): string {
  switch (namespace) {
    case "run":
    case "scratchpad":
      return `run:${scope.runId}`;
    case "thread":
      return `user:${scope.userId}:thread:${scope.threadId}`;
    case "user":
      return `user:${scope.userId}`;
    case "project":
      return `project:${scope.projectId}`;
    case "audit":
      return `audit:${scope.runId}`;
  }
}

function recordKey(namespace: MemoryNamespace, scopeKey: string, key: string): string {
  return `${namespace}:${scopeKey}:${key}`;
}
