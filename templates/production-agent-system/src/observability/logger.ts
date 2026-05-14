import type { RunContext } from "../runtime/run-context.js";
import { redactValue } from "./redaction.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  event: string;
  runId?: string;
  traceId?: string;
  status?: string;
  message?: string;
  fields?: Record<string, unknown>;
};

export type Logger = {
  log(entry: Omit<LogEntry, "timestamp">): void;
  debug(event: string, fields?: Record<string, unknown>, context?: RunContext): void;
  info(event: string, fields?: Record<string, unknown>, context?: RunContext): void;
  warn(event: string, fields?: Record<string, unknown>, context?: RunContext): void;
  error(event: string, fields?: Record<string, unknown>, context?: RunContext): void;
  entries(): LogEntry[];
};

export type LoggerOptions = {
  captureSensitiveData?: boolean;
};

export function createInMemoryLogger(options: LoggerOptions = {}): Logger {
  const entries: LogEntry[] = [];
  const sanitize = <T>(value: T): T => (options.captureSensitiveData ? value : redactValue(value));

  function write(entry: Omit<LogEntry, "timestamp">): void {
    entries.push(sanitize({
      ...entry,
      timestamp: new Date().toISOString(),
    }));
  }

  function writeLevel(level: LogLevel, event: string, fields?: Record<string, unknown>, context?: RunContext): void {
    write({
      level,
      event,
      runId: context?.runId,
      traceId: context?.traceId,
      fields,
    });
  }

  return {
    log: write,
    debug(event, fields, context) {
      writeLevel("debug", event, fields, context);
    },
    info(event, fields, context) {
      writeLevel("info", event, fields, context);
    },
    warn(event, fields, context) {
      writeLevel("warn", event, fields, context);
    },
    error(event, fields, context) {
      writeLevel("error", event, fields, context);
    },
    entries() {
      return entries.map((entry) => sanitize({ ...entry, fields: entry.fields ? { ...entry.fields } : undefined }));
    },
  };
}
