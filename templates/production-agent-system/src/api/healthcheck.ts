import { readRuntimeEnv } from "../config/env.js";

const env = readRuntimeEnv();
const healthcheckUrl = process.env.HEALTHCHECK_URL?.trim() || `http://127.0.0.1:${env.port}/healthz`;

try {
  const response = await fetch(healthcheckUrl, {
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Healthcheck returned HTTP ${response.status}.`);
  }

  const body = (await response.json()) as { status?: string };
  if (body.status !== "ok") {
    throw new Error(`Healthcheck returned status '${body.status ?? "missing"}'.`);
  }

  console.log(`Healthcheck passed: ${healthcheckUrl}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Healthcheck failed.");
  process.exitCode = 1;
}
