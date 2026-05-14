# Threat Model

Initial threats to review:

- prompt injection through user input or external documents
- unsafe tool execution
- data exfiltration through logs, traces, memory, or eval reports
- unauthorized destructive action
- dependency or deployment misconfiguration

Record mitigations and open risks before production deployment.

Current mitigations in the template:

- prompt injection check in input guardrails
- high/destructive approval gate
- secret redaction helper
- data classifier starter policy
- structured security policy errors
