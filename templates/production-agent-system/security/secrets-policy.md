# Secrets Policy

Secrets must be provided through environment variables or a managed secrets service. Do not commit secret values.

Examples that must be redacted:

- API keys
- OAuth tokens
- private keys
- database passwords
- webhook signing secrets

Use `src/security/secret-redactor.ts` or the shared observability redaction helpers before writing logs, traces, memory, eval reports, or audit events.
