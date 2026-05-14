import assert from "node:assert/strict";
import test from "node:test";
import { createInitialRunState } from "../src/runtime/run-state.js";
import {
  createConversationStore,
  createInMemoryCheckpointStore,
  createInMemoryMemoryStore,
  createRunContext,
} from "../src/index.js";

test("thread memory is isolated by thread_id", async () => {
  const memoryStore = createInMemoryMemoryStore();
  const conversationStore = createConversationStore(memoryStore);

  await conversationStore.append({
    userId: "user-1",
    threadId: "thread-a",
    source: "test",
    message: {
      role: "user",
      content: "Thread A message",
      createdAt: "2026-05-14T00:00:00.000Z",
    },
  });
  await conversationStore.append({
    userId: "user-1",
    threadId: "thread-b",
    source: "test",
    message: {
      role: "user",
      content: "Thread B message",
      createdAt: "2026-05-14T00:00:01.000Z",
    },
  });

  const threadA = await conversationStore.list({ userId: "user-1", threadId: "thread-a" });
  const threadB = await conversationStore.list({ userId: "user-1", threadId: "thread-b" });

  assert.deepEqual(threadA.map((message) => message.content), ["Thread A message"]);
  assert.deepEqual(threadB.map((message) => message.content), ["Thread B message"]);
});

test("user memory and run scratchpad are stored in separate namespaces", async () => {
  const memoryStore = createInMemoryMemoryStore();

  await memoryStore.write({
    namespace: "user",
    scope: { userId: "user-1" },
    key: "preference",
    value: { theme: "compact" },
    source: "test",
  });

  await memoryStore.write({
    namespace: "scratchpad",
    scope: { runId: "run-1" },
    key: "draft",
    value: { intermediate: "temporary" },
    source: "test",
  });

  const userMemory = await memoryStore.list({ namespace: "user", scope: { userId: "user-1" } });
  const scratchpad = await memoryStore.list({ namespace: "scratchpad", scope: { runId: "run-1" } });

  assert.equal(userMemory.length, 1);
  assert.equal(scratchpad.length, 1);
  assert.equal(userMemory[0]?.namespace, "user");
  assert.equal(scratchpad[0]?.namespace, "scratchpad");
});

test("memory write policy rejects sensitive long-term user memory", async () => {
  const memoryStore = createInMemoryMemoryStore();

  await assert.rejects(
    memoryStore.write({
      namespace: "user",
      scope: { userId: "user-1" },
      key: "secret",
      value: { token: "sk-testsecret12345" },
      source: "test",
    }),
    /Sensitive data classes are not allowed/,
  );
});

test("checkpoint store can save and load a run for resume", async () => {
  const checkpointStore = createInMemoryCheckpointStore();
  const context = createRunContext({
    runId: "run-resume-1",
    traceId: "trace-resume-1",
    userId: "user-1",
    threadId: "thread-1",
  });
  const state = createInitialRunState(context);

  await checkpointStore.save({
    context,
    state,
    data: {
      nextStep: "continue-tool-plan",
    },
  });

  const checkpoint = await checkpointStore.load("run-resume-1");
  assert.equal(checkpoint?.runId, "run-resume-1");
  assert.equal(checkpoint?.state.status, "running");
  assert.deepEqual(checkpoint?.data, { nextStep: "continue-tool-plan" });

  const latest = await checkpointStore.latestForThread({ userId: "user-1", threadId: "thread-1" });
  assert.equal(latest?.runId, "run-resume-1");
});
