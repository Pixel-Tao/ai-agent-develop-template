# Metrics

Recommended metrics:

- agent_run_latency_ms
- llm_call_latency_ms
- tool_call_latency_ms
- tool_failure_count
- approval_request_count
- memory_write_count
- eval_case_score
- eval_suite_pass_rate

Metrics are recorded through the template `Metrics` interface so production deployments can replace the in-memory adapter.
