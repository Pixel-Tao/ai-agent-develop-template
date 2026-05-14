import type { MemoryStore } from "./memory-store.js";

export type ConversationMessage = {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  createdAt: string;
};

export type ConversationStore = {
  append(input: {
    userId: string;
    threadId: string;
    message: Omit<ConversationMessage, "createdAt"> & { createdAt?: string };
    source: string;
  }): Promise<ConversationMessage>;
  list(input: { userId: string; threadId: string }): Promise<ConversationMessage[]>;
};

export function createConversationStore(memoryStore: MemoryStore): ConversationStore {
  return {
    async append(input) {
      const message: ConversationMessage = {
        ...input.message,
        createdAt: input.message.createdAt ?? new Date().toISOString(),
      };
      const key = `message:${message.createdAt}:${message.role}`;
      await memoryStore.write({
        namespace: "thread",
        scope: {
          userId: input.userId,
          threadId: input.threadId,
        },
        key,
        value: message,
        source: input.source,
      });
      return message;
    },
    async list(input) {
      const records = await memoryStore.list({
        namespace: "thread",
        scope: {
          userId: input.userId,
          threadId: input.threadId,
        },
      });
      return records.map((record) => record.value as ConversationMessage);
    },
  };
}
