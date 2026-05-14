import type { ToolRiskLevel } from "../tools/tool.js";
import { redactValue } from "./redaction.js";

export type AuditEvent = {
  event: string;
  timestamp?: string;
  runId?: string;
  traceId?: string;
  toolName?: string;
  riskLevel?: ToolRiskLevel;
  status?: "started" | "completed" | "failed";
  details?: Record<string, unknown>;
};

export type AuditLog = {
  record(event: AuditEvent): void;
  entries(): Array<AuditEvent & Required<Pick<AuditEvent, "event" | "timestamp">>>;
};

export function createInMemoryAuditLog(): AuditLog {
  const events: Array<Required<Pick<AuditEvent, "event" | "timestamp">> & AuditEvent> = [];

  return {
    record(event) {
      events.push({
        ...redactValue(event),
        event: event.event,
        timestamp: event.timestamp ?? new Date().toISOString(),
      } as Required<Pick<AuditEvent, "event" | "timestamp">> & AuditEvent);
    },
    entries() {
      return [...events];
    },
  };
}
