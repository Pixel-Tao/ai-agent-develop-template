# Verification Matrix

| Work type | Minimum verification | Additional verification | Evidence location | Completion criteria |
|---|---|---|---|---|
| template generation | `npm run validate:structure` | zip file list inspection | harness/evidence-log.md | Required runtime, tools, memory, evals, observability, deploy, security paths exist and no unresolved placeholders remain. |
| runtime skeleton | runtime test | build | harness/evidence-log.md | Mock provider run path works without API key. |
| tool registry | `npm run validate:tools` and `npm run test` | approval denial test | harness/evidence-log.md | Invalid input is blocked before execution and high/destructive tools cannot run without approval. |
| memory | `npm run test` memory cases | checkpoint resume test | harness/evidence-log.md | Thread memory is isolated, user memory and scratchpad are separated, sensitive long-term memory is rejected, checkpoint resume works. |
| evals | `npm run eval:smoke` | `npm run eval` and report inspection | harness/evidence-log.md | Mock-provider evals run without API keys, reports are written, and threshold failures exit non-zero. |
| observability | `npm run test` observability cases | trace/log/metric/audit inspection | harness/evidence-log.md | Agent, tool, and memory operations emit observability events and secrets do not appear raw in logs or traces. |
| security | `npm run test` security cases | prompt injection and approval audit inspection | harness/evidence-log.md | Policy failures return structured errors, secrets are redacted, and high/destructive actions require approval. |
| deployment | `npm run build` and `npm run test` deployment cases | `npm run docker:build` and `npm run healthcheck` against a running API | harness/evidence-log.md | API health endpoint responds, env validation fails clearly, worker queue processes one job, and Docker image builds when Docker is available. |

## Evidence Rules

- Store generated reports in harness/reports.
- Record failed commands with cause and next action.
- Separate automatic verification from manual inspection.
