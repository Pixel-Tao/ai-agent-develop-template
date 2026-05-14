# Retention Policy

Memory retention must be explicit per namespace.

| Namespace | Default retention | Notes |
|---|---|---|
| run | Delete or summarize after run completion | Keep only non-sensitive summaries when needed. |
| thread | Keep while thread is active | Separate by `thread_id`. |
| user | Long-term opt-in only | Do not store sensitive data. |
| project | Long-term | Record source and updated date. |
| scratchpad | Ephemeral | Never expose externally. |
| audit | Long-term append-only | Use for approval and policy events. |

The template provides an in-memory implementation for tests and local development. Production deployments should replace it with an adapter that preserves the same `MemoryStore` and `CheckpointStore` interfaces.
