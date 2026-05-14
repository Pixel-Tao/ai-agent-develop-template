import { randomUUID } from "node:crypto";

export type RunContext = {
  runId: string;
  traceId: string;
  userId: string;
  threadId: string;
  projectId?: string;
  startedAt: string;
};

export type CreateRunContextInput = {
  runId?: string;
  traceId?: string;
  userId: string;
  threadId: string;
  projectId?: string;
  startedAt?: string;
};

export function createRunContext(input: CreateRunContextInput): RunContext {
  return {
    runId: input.runId ?? createId("run"),
    traceId: input.traceId ?? createId("trace"),
    userId: input.userId,
    threadId: input.threadId,
    projectId: input.projectId,
    startedAt: input.startedAt ?? new Date().toISOString(),
  };
}

function createId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}
