import { runAgent } from "../agent/runner.js";
import { readRuntimeEnv, type RuntimeEnv } from "../config/env.js";
import { createRunContext } from "../runtime/run-context.js";
import { createInMemoryAgentQueue, type AgentJob, type AgentJobQueue } from "./queue.js";

export type WorkerProcessResult = {
  status: "idle" | "completed" | "failed";
  job?: AgentJob;
};

export async function processNextJob(queue: AgentJobQueue): Promise<WorkerProcessResult> {
  const job = await queue.next();
  if (!job) {
    return { status: "idle" };
  }

  const result = await runAgent(
    { message: job.message, metadata: job.metadata },
    createRunContext({
      userId: job.userId,
      threadId: job.threadId,
      projectId: job.projectId,
    }),
  );

  if (result.status === "completed") {
    queue.complete(job.id, result);
    return { status: "completed", job: queue.get(job.id) };
  }

  queue.fail(job.id, new Error(result.error.message));
  return { status: "failed", job: queue.get(job.id) };
}

export async function runWorkerOnce(queue = createDefaultQueue()): Promise<WorkerProcessResult> {
  const result = await processNextJob(queue);
  console.log(JSON.stringify(result));
  return result;
}

export async function runWorkerLoop(
  queue: AgentJobQueue,
  options: { env?: RuntimeEnv; signal?: AbortSignal } = {},
): Promise<void> {
  const env = options.env ?? readRuntimeEnv();

  while (!options.signal?.aborted) {
    const result = await processNextJob(queue);
    if (result.status === "idle") {
      await delay(env.workerPollMs, options.signal);
    }
  }
}

export async function startWorker(env: RuntimeEnv = readRuntimeEnv()): Promise<void> {
  const queue = createInMemoryAgentQueue();
  const abortController = new AbortController();
  installWorkerShutdownHandlers(abortController, env);

  console.log(`Agent worker started with queue mode '${env.queueMode}'.`);
  await runWorkerLoop(queue, { env, signal: abortController.signal });
}

if (process.argv[1]?.endsWith("agent-worker.js")) {
  await startWorker();
}

function createDefaultQueue(): AgentJobQueue {
  return createInMemoryAgentQueue([
    {
      message: "Process one mock background Agent job.",
      userId: "worker-user",
      threadId: "worker-thread",
    },
  ]);
}

function installWorkerShutdownHandlers(abortController: AbortController, env: RuntimeEnv): void {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log(`Received ${signal}. Stopping Agent worker within ${env.shutdownGraceMs}ms.`);
    abortController.abort();
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}
