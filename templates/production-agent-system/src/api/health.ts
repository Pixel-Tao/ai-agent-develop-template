import { readRuntimeEnv, type RuntimeEnv } from "../config/env.js";

export type HealthDependencyStatus = "ok" | "disabled" | "not_configured";

export type HealthDependency = {
  name: "model_provider" | "queue" | "database" | "trace_exporter";
  status: HealthDependencyStatus;
  details?: string;
};

export type HealthResponse = {
  status: "ok";
  service: string;
  version: string;
  environment: RuntimeEnv["nodeEnv"];
  uptimeSeconds: number;
  checks: HealthDependency[];
};

export function getHealth(env: RuntimeEnv = readRuntimeEnv()): HealthResponse {
  return {
    status: "ok",
    service: env.serviceName,
    version: env.serviceVersion,
    environment: env.nodeEnv,
    uptimeSeconds: Math.round(process.uptime()),
    checks: [
      {
        name: "model_provider",
        status: "ok",
        details: `${env.modelProvider}:${env.modelName}`,
      },
      {
        name: "queue",
        status: env.queueMode === "disabled" ? "disabled" : "ok",
        details: env.queueMode,
      },
      {
        name: "database",
        status: env.databaseUrl ? "ok" : "not_configured",
        details: env.databaseUrl ? "configured" : "optional for this template skeleton",
      },
      {
        name: "trace_exporter",
        status: env.traceExporter ? "ok" : "disabled",
        details: env.traceExporter ? "configured" : "in-memory tracer only",
      },
    ],
  };
}
