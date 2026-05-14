import { createServer, type Server } from "node:http";
import { readRuntimeEnv, type RuntimeEnv } from "../config/env.js";
import { RequestBodyError, routeRequest } from "./routes.js";

export type AgentApiServerOptions = {
  env?: RuntimeEnv;
  maxBodyBytes?: number;
};

export function createAgentApiServer(options: AgentApiServerOptions = {}): Server {
  const env = options.env ?? readRuntimeEnv();

  return createServer((request, response) => {
    void routeRequest(request, response, { env, maxBodyBytes: options.maxBodyBytes }).catch((error: unknown) => {
      const statusCode = error instanceof RequestBodyError ? 400 : 500;
      const errorCode = error instanceof RequestBodyError ? error.code : "internal_error";
      const message = error instanceof Error ? error.message : "unknown_error";

      response.writeHead(statusCode, {
        "cache-control": "no-store",
        "content-type": "application/json",
      });
      response.end(JSON.stringify({ error: errorCode, message }));
    });
  });
}

export async function startServer(env: RuntimeEnv = readRuntimeEnv()): Promise<Server> {
  const server = createAgentApiServer({ env });

  await new Promise<void>((resolve) => {
    server.listen(env.port, env.host, resolve);
  });

  console.log(`Agent API listening on ${env.host}:${env.port}`);
  installGracefulShutdown(server, env);

  return server;
}

function installGracefulShutdown(server: Server, env: RuntimeEnv): void {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log(`Received ${signal}. Closing Agent API server.`);

    const forceExitTimer = setTimeout(() => {
      console.error(`Forced shutdown after ${env.shutdownGraceMs}ms.`);
      process.exit(1);
    }, env.shutdownGraceMs);
    forceExitTimer.unref();

    server.close((error?: Error) => {
      clearTimeout(forceExitTimer);
      if (error) {
        console.error(error.message);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

if (process.argv[1]?.endsWith("server.js")) {
  await startServer();
}
