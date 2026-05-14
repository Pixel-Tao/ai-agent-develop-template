# Tracing Policy

Every Agent run should have `run_id` and `trace_id`. Trace spans should cover Agent run lifecycle, LLM calls, tool calls, guardrails, memory reads/writes, approval requests, and eval execution.

Trace payloads must not include secrets, credentials, or raw sensitive user data by default.

Required span names:

- `agent.run`
- `guardrail.input`
- `guardrail.output`
- `llm.call`
- `tool.call`
- `approval.requested`
- `memory.write.requested`
- `memory.read`

Sensitive capture is opt-in through tracer construction options and must be documented before use.
