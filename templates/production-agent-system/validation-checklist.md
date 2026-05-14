# Validation Checklist

## Template Structure

- [ ] README.md exists.
- [ ] AGENTS.md exists.
- [ ] INIT.md exists.
- [ ] manifest.yaml and template.yaml have matching template ids.
- [ ] harness/ contains commands, verification matrix, and evidence log.
- [ ] skills/skills-index.yaml exists.

## Runtime Structure

- [ ] package.json exists.
- [ ] package-lock.json and .dockerignore exist.
- [ ] tsconfig.json exists.
- [ ] scripts/validate-structure.mjs exists.
- [ ] src/index.ts exists.
- [ ] src/config/env.ts and src/config/model-config.ts exist.
- [ ] src/agent/agent.ts, src/agent/runner.ts, src/agent/instructions.ts, src/agent/handoffs.ts exist.
- [ ] src/runtime/run-context.ts, src/runtime/run-state.ts, src/runtime/errors.ts, src/runtime/lifecycle-hooks.ts exist.
- [ ] src/tools, src/guardrails, src/memory are present.
- [ ] src/evals, src/observability, src/security are present.
- [ ] src/api and src/workers are present.
- [ ] src/api/health.ts and src/api/healthcheck.ts exist.
- [ ] src/workers/queue.ts exists.
- [ ] tests/runtime.test.ts exists.
- [ ] tests/api.test.ts and tests/deployment.test.ts exist.
- [ ] `npm run build` passes.
- [ ] `npm run validate:structure` passes.
- [ ] `npm run test` passes.

## Tool Registry

- [ ] tools/tool-registry.yaml lists name, description, input_schema, output_schema, risk_level, and implementation for each tool.
- [ ] tools/permissions.yaml defines low, medium, high, destructive risk levels.
- [ ] high and destructive risk levels require approval.
- [ ] src/tools/tool-runner.ts validates input before execution.
- [ ] src/tools/tool-runner.ts records audit events before and after execution.
- [ ] src/tools/tool-runner.ts redacts output by default.
- [ ] `npm run validate:tools` passes.
- [ ] `npm run test` includes approval denial and invalid input tests.

## Memory and Checkpoint

- [ ] src/memory/memory-store.ts exists.
- [ ] src/memory/memory-policy.ts exists.
- [ ] src/memory/checkpoint-store.ts exists.
- [ ] src/memory/conversation-store.ts exists.
- [ ] run, thread, user, project, scratchpad, and audit namespaces are defined.
- [ ] thread_id scoped state does not mix across threads.
- [ ] user memory and run scratchpad are separated.
- [ ] sensitive long-term user memory is rejected by default.
- [ ] checkpoint save/load supports mock resume.
- [ ] `npm run test` includes memory namespace and checkpoint tests.

## Eval Harness

- [ ] evals/datasets/smoke.yaml exists.
- [ ] evals/datasets/tool-use.yaml exists.
- [ ] evals/datasets/refusal.yaml exists.
- [ ] evals/datasets/regression.yaml exists.
- [ ] evals/scorers/exact-match.ts exists.
- [ ] evals/scorers/rubric-score.ts exists.
- [ ] evals/scorers/tool-call-score.ts exists.
- [ ] evals/scorers/safety-score.ts exists.
- [ ] src/evals/dataset-loader.ts exists.
- [ ] src/evals/scorers.ts exists.
- [ ] src/evals/report-writer.ts exists.
- [ ] src/evals/eval-runner.ts exists.
- [ ] `npm run eval:smoke` passes without provider API keys.
- [ ] `npm run eval` passes without provider API keys.
- [ ] eval reports are written to evals/reports.
- [ ] threshold failure behavior returns a non-zero exit.

## Observability

- [ ] src/observability/tracer.ts exists.
- [ ] src/observability/logger.ts exists.
- [ ] src/observability/metrics.ts exists.
- [ ] src/observability/audit-log.ts exists.
- [ ] src/observability/redaction.ts exists.
- [ ] Agent run emits agent, guardrail, and LLM spans.
- [ ] Tool call emits trace, audit, and metric events.
- [ ] Memory write emits trace and metric events.
- [ ] Logs and traces redact secret-like values by default.
- [ ] Sensitive data capture requires explicit opt-in.
- [ ] `npm run test` includes observability tests.

## Security and Compliance

- [ ] src/security/policy-engine.ts exists.
- [ ] src/security/approval-gate.ts exists.
- [ ] src/security/data-classifier.ts exists.
- [ ] src/security/secret-redactor.ts exists.
- [ ] src/security/prompt-injection-check.ts exists.
- [ ] Secret-like values are redacted by default.
- [ ] PII, secret, credential, financial, health, source-code classes are detectable.
- [ ] Prompt injection attempts are blocked or downgraded.
- [ ] Destructive actions require human approval.
- [ ] Security policy failures return structured errors.
- [ ] `npm run test` includes security tests.

## Operations Structure

- [ ] tools/tool-registry.yaml exists.
- [ ] tools/permissions.yaml exists.
- [ ] memory policy files exist.
- [ ] observability policy files exist.
- [ ] security policy files exist.
- [ ] deploy files exist.
- [ ] tests/ placeholder files exist for runtime, tools, memory, evals, security.

## Deployment

- [ ] deploy/Dockerfile builds the TypeScript project and runs compiled API code.
- [ ] deploy/docker-compose.yml defines API and worker services.
- [ ] deploy/env.example contains no production secret values.
- [ ] `/healthz` returns service, version, environment, uptime, and dependency status.
- [ ] `/agent/run` accepts JSON input and rejects invalid JSON with a 400 response.
- [ ] Worker queue skeleton can process one queued job.
- [ ] Production env validation reports missing required variables clearly.
- [ ] API and worker support SIGTERM/SIGINT shutdown paths.
- [ ] `npm run healthcheck` is documented for a running API server.
- [ ] `npm run docker:build` builds the local image when Docker is available.

## Phase Notes

- [ ] Phase 1 generation command was executed.
- [ ] Phase 1 evidence was recorded.
- [ ] Phase 2 build and runtime tests were executed before runtime completion is reported.
- [ ] Phase 3 tool validation and approval tests were executed before tool calling is reported complete.
- [ ] Phase 4 memory namespace, policy, and checkpoint tests were executed before memory is reported complete.
- [ ] Phase 5 eval smoke/full commands and eval tests were executed before eval harness is reported complete.
- [ ] Phase 6 trace, log, metric, audit, and redaction tests were executed before observability is reported complete.
- [ ] Phase 7 policy engine, approval, classifier, redaction, and prompt injection tests were executed before security is reported complete.
- [ ] Phase 8 API, worker, env validation, Docker, and healthcheck tests were executed before deployment is reported complete.
