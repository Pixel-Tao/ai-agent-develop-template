# Logging

Use structured logs. Separate debug logs from audit logs. Redact secret-like values before writing logs.

Required fields:

- timestamp
- level
- event
- run_id
- trace_id
- status

The template provides `createInMemoryLogger()` for local development and tests. Production deployments should replace it with a sink that preserves the same structured fields and redaction behavior.
