# Tool Risk Policy

| Risk level | Default policy |
|---|---|
| low | May run automatically with audit event. |
| medium | May run automatically with stricter timeout and audit event. |
| high | Requires human approval. |
| destructive | Requires human approval and audit event. |

Tool risk must be declared in `tools/tool-registry.yaml`.

Security policy checks live in `src/security/policy-engine.ts`; tool execution approval checks are enforced by `src/tools/tool-runner.ts` and covered by tests.
