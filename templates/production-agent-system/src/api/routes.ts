import type { IncomingMessage, ServerResponse } from "node:http";
import type { RuntimeEnv } from "../config/env.js";
import { runAgent } from "../agent/runner.js";
import { createRunContext } from "../runtime/run-context.js";
import { getHealth } from "./health.js";

export type RouteRequestOptions = {
  env?: RuntimeEnv;
  maxBodyBytes?: number;
};

export async function routeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: RouteRequestOptions = {},
): Promise<void> {
  const path = getPath(request);

  if (request.method === "GET" && path === "/healthz") {
    sendJson(response, 200, getHealth(options.env));
    return;
  }

  if (request.method === "POST" && path === "/agent/run") {
    const body = await readJsonBody(request, options.maxBodyBytes);
    if (typeof body.message !== "string" || !body.message.trim()) {
      sendJson(response, 400, {
        error: "invalid_request",
        message: "Request body must include a non-empty string field named 'message'.",
      });
      return;
    }

    const result = await runAgent(
      { message: body.message, metadata: readRecord(body.metadata) },
      createRunContext({
        userId: readString(body.user_id, "api-user"),
        threadId: readString(body.thread_id, "api-thread"),
        projectId: readOptionalString(body.project_id),
      }),
    );
    sendJson(response, result.status === "completed" ? 200 : 400, result);
    return;
  }

  sendJson(response, 404, { error: "not_found" });
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    "cache-control": "no-store",
    "content-type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request: IncomingMessage, maxBodyBytes = 1_000_000): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let receivedBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    receivedBytes += buffer.byteLength;
    if (receivedBytes > maxBodyBytes) {
      throw new RequestBodyError("request_too_large", "Request body exceeds the configured size limit.");
    }
    chunks.push(buffer);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
  } catch {
    throw new RequestBodyError("invalid_json", "Request body must be valid JSON.");
  }
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function getPath(request: IncomingMessage): string {
  return new URL(request.url ?? "/", "http://localhost").pathname;
}

export class RequestBodyError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
