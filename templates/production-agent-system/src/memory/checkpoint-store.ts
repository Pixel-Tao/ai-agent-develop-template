import { randomUUID } from "node:crypto";
import type { RunContext } from "../runtime/run-context.js";
import type { RunState } from "../runtime/run-state.js";

export type AgentCheckpoint = {
  id: string;
  runId: string;
  threadId: string;
  userId: string;
  state: RunState;
  data: Record<string, unknown>;
  createdAt: string;
};

export type CheckpointStore = {
  save(input: {
    context: RunContext;
    state: RunState;
    data?: Record<string, unknown>;
  }): Promise<AgentCheckpoint>;
  load(runId: string): Promise<AgentCheckpoint | undefined>;
  latestForThread(input: { userId: string; threadId: string }): Promise<AgentCheckpoint | undefined>;
};

export type ProductionCheckpointAdapter = CheckpointStore;

export function createInMemoryCheckpointStore(seed: AgentCheckpoint[] = []): CheckpointStore {
  const checkpoints = new Map(seed.map((checkpoint) => [checkpoint.runId, checkpoint]));

  return {
    async save(input) {
      const checkpoint: AgentCheckpoint = {
        id: `checkpoint_${randomUUID()}`,
        runId: input.context.runId,
        threadId: input.context.threadId,
        userId: input.context.userId,
        state: input.state,
        data: input.data ?? {},
        createdAt: new Date().toISOString(),
      };
      checkpoints.set(checkpoint.runId, checkpoint);
      return checkpoint;
    },
    async load(runId) {
      return checkpoints.get(runId);
    },
    async latestForThread(input) {
      return [...checkpoints.values()]
        .filter((checkpoint) => checkpoint.userId === input.userId && checkpoint.threadId === input.threadId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    },
  };
}
