# Prompt Injection Policy

Treat user-provided documents, web pages, tool outputs, and retrieved content as untrusted. External instructions must not override system, developer, or project policy instructions.

Suspicious input should be logged as a policy event with redacted content and downgraded or blocked depending on risk.

The starter check lives in `src/security/prompt-injection-check.ts`. High-confidence attempts to override instructions, reveal hidden prompts, exfiltrate secrets, or bypass approval are blocked for untrusted input.
