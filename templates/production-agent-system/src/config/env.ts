export type RuntimeEnv = {
  nodeEnv: "development" | "test" | "production";
  host: string;
  port: number;
  logLevel: "debug" | "info" | "warn" | "error";
  modelProvider: "mock";
  modelName: string;
  serviceName: string;
  serviceVersion: string;
  queueMode: "memory" | "external" | "disabled";
  queueUrl?: string;
  databaseUrl?: string;
  traceExporter?: string;
  workerPollMs: number;
  shutdownGraceMs: number;
};

export function readRuntimeEnv(source: NodeJS.ProcessEnv = process.env): RuntimeEnv {
  const nodeEnv = readEnum(source.NODE_ENV, ["development", "test", "production"], "development");
  assertRequiredProductionEnv(source, nodeEnv);

  const host = source.HOST?.trim() || "0.0.0.0";
  const logLevel = readEnum(source.LOG_LEVEL, ["debug", "info", "warn", "error"], "info");
  const modelProvider = readEnum(source.MODEL_PROVIDER, ["mock"], "mock");
  const modelName = source.MODEL_NAME?.trim() || "mock-agent";
  const serviceName = source.SERVICE_NAME?.trim() || "production-agent-system";
  const serviceVersion = source.SERVICE_VERSION?.trim() || "0.1.0";
  const port = readPort(source.PORT ?? "3000");
  const queueUrl = readOptional(source.QUEUE_URL);
  const databaseUrl = readOptional(source.DATABASE_URL);
  const traceExporter = readOptional(source.TRACE_EXPORTER);
  const queueMode = readEnum(source.QUEUE_MODE, ["memory", "external", "disabled"], queueUrl ? "external" : "memory");
  const workerPollMs = readPositiveInteger(source.AGENT_WORKER_POLL_MS ?? "1000", "AGENT_WORKER_POLL_MS");
  const shutdownGraceMs = readPositiveInteger(source.SHUTDOWN_GRACE_MS ?? "10000", "SHUTDOWN_GRACE_MS");

  if (queueMode === "external" && !queueUrl) {
    throw new Error("QUEUE_MODE=external requires QUEUE_URL to be set.");
  }

  return {
    nodeEnv,
    host,
    port,
    logLevel,
    modelProvider,
    modelName,
    serviceName,
    serviceVersion,
    queueMode,
    queueUrl,
    databaseUrl,
    traceExporter,
    workerPollMs,
    shutdownGraceMs,
  };
}

function assertRequiredProductionEnv(source: NodeJS.ProcessEnv, nodeEnv: RuntimeEnv["nodeEnv"]): void {
  if (nodeEnv !== "production") {
    return;
  }

  const required = ["NODE_ENV", "PORT", "LOG_LEVEL", "MODEL_PROVIDER", "MODEL_NAME", "SERVICE_VERSION"];
  const missing = required.filter((name) => !source[name]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }
}

function readEnum<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  if (!value) {
    return fallback;
  }

  if (allowed.includes(value as T)) {
    return value as T;
  }

  throw new Error(`Invalid enum value '${value}'. Allowed values: ${allowed.join(", ")}`);
}

function readPort(value: string): number {
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT '${value}'. Expected an integer between 1 and 65535.`);
  }

  return port;
}

function readPositiveInteger(value: string, name: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid ${name} '${value}'. Expected a positive integer.`);
  }

  return parsed;
}

function readOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
