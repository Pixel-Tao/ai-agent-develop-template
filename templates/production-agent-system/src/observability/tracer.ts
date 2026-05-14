import type { RunContext } from "../runtime/run-context.js";
import { redactValue } from "./redaction.js";

export type TraceStatus = "completed" | "failed";

export type TraceAttributes = Record<string, unknown>;

export type TraceEvent = {
  name: string;
  runId: string;
  traceId: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  status?: TraceStatus;
  attributes: TraceAttributes;
};

export type TraceSpan = {
  event: TraceEvent;
  end(status: TraceStatus, attributes?: TraceAttributes): void;
};

export type InMemoryTracer = {
  startSpan(name: string, context: RunContext, attributes?: TraceAttributes): TraceSpan;
  events(): TraceEvent[];
};

export type TracerOptions = {
  captureSensitiveData?: boolean;
};

export function createInMemoryTracer(options: TracerOptions = {}): InMemoryTracer {
  const traceEvents: TraceEvent[] = [];
  const sanitize = <T>(value: T): T => (options.captureSensitiveData ? value : redactValue(value));

  return {
    startSpan(name, context, attributes = {}) {
      const startedAtMs = Date.now();
      const event: TraceEvent = {
        name,
        runId: context.runId,
        traceId: context.traceId,
        startedAt: new Date(startedAtMs).toISOString(),
        attributes: sanitize(attributes),
      };
      traceEvents.push(event);

      return {
        event,
        end(status, endAttributes = {}) {
          const endedAtMs = Date.now();
          event.status = status;
          event.endedAt = new Date(endedAtMs).toISOString();
          event.durationMs = endedAtMs - startedAtMs;
          event.attributes = sanitize({
            ...event.attributes,
            ...endAttributes,
          });
        },
      };
    },
    events() {
      return traceEvents.map((event) => sanitize({ ...event, attributes: { ...event.attributes } }));
    },
  };
}
