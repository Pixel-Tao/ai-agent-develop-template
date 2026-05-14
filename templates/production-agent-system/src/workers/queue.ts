import { randomUUID } from "node:crypto";
import type { AgentRunResult } from "../agent/runner.js";

export type AgentJobStatus = "queued" | "running" | "completed" | "failed";

export type EnqueueAgentJobInput = {
  message: string;
  userId: string;
  threadId: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
  maxAttempts?: number;
};

export type AgentJob = EnqueueAgentJobInput & {
  id: string;
  status: AgentJobStatus;
  attempts: number;
  maxAttempts: number;
  enqueuedAt: string;
  startedAt?: string;
  completedAt?: string;
  lastError?: string;
  result?: AgentRunResult;
};

export type AgentJobQueue = {
  enqueue(input: EnqueueAgentJobInput): AgentJob;
  next(): Promise<AgentJob | undefined>;
  complete(jobId: string, result: AgentRunResult): void;
  fail(jobId: string, error: Error): void;
  get(jobId: string): AgentJob | undefined;
  list(): AgentJob[];
  size(): number;
};

export function createInMemoryAgentQueue(seedJobs: EnqueueAgentJobInput[] = []): AgentJobQueue {
  const jobs = new Map<string, AgentJob>();
  const queuedJobIds: string[] = [];

  const queue: AgentJobQueue = {
    enqueue(input) {
      const job: AgentJob = {
        ...input,
        id: `job_${randomUUID()}`,
        status: "queued",
        attempts: 0,
        maxAttempts: input.maxAttempts ?? 3,
        enqueuedAt: new Date().toISOString(),
      };
      jobs.set(job.id, job);
      queuedJobIds.push(job.id);
      return cloneJob(job);
    },

    async next() {
      const jobId = queuedJobIds.shift();
      if (!jobId) {
        return undefined;
      }

      const job = jobs.get(jobId);
      if (!job) {
        return undefined;
      }

      job.status = "running";
      job.attempts += 1;
      job.startedAt = new Date().toISOString();
      return cloneJob(job);
    },

    complete(jobId, result) {
      const job = requireJob(jobs, jobId);
      job.status = "completed";
      job.completedAt = new Date().toISOString();
      job.result = result;
    },

    fail(jobId, error) {
      const job = requireJob(jobs, jobId);
      job.lastError = error.message;

      if (job.attempts < job.maxAttempts) {
        job.status = "queued";
        queuedJobIds.push(job.id);
        return;
      }

      job.status = "failed";
      job.completedAt = new Date().toISOString();
    },

    get(jobId) {
      const job = jobs.get(jobId);
      return job ? cloneJob(job) : undefined;
    },

    list() {
      return Array.from(jobs.values()).map(cloneJob);
    },

    size() {
      return queuedJobIds.length;
    },
  };

  for (const job of seedJobs) {
    queue.enqueue(job);
  }

  return queue;
}

function requireJob(jobs: Map<string, AgentJob>, jobId: string): AgentJob {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Unknown job '${jobId}'.`);
  }

  return job;
}

function cloneJob(job: AgentJob): AgentJob {
  return {
    ...job,
    metadata: job.metadata ? { ...job.metadata } : undefined,
  };
}
