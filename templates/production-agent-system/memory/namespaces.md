# Memory Namespaces

Use separate namespaces for run, thread, user, project, scratchpad, and audit data. A memory write must identify the namespace, source, owner scope, and retention expectation.

Do not mix `thread_id` scoped data with `user_id` or `project_id` scoped memory.

| Namespace | Required scope | Default policy |
|---|---|---|
| run | run_id | Single-run state. |
| thread | user_id, thread_id | Conversation state isolated by thread. |
| user | user_id | Long-term preference memory; sensitive data rejected by default. |
| project | project_id | Long-term project memory with source tracking. |
| scratchpad | run_id | Ephemeral working state. |
| audit | run_id | Append-oriented policy and approval evidence. |
