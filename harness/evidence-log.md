# Repository Evidence Log

| Date | Phase | Command | Result | Notes |
|---|---|---|---|---|
| 2026-05-13 | Phase 0 | `node scripts/validate-template.mjs` | pass | Templates checked: 9; YAML files checked: 115. |
| 2026-05-13 | Phase 0 | `node scripts/create-project.mjs --list` | pass | Output matched `templates-index.yaml`: ai-data-project, existing-project-onboarding, greenfield-basic, large-team-collaboration, legacy-modernization, maintenance-operations, monorepo-multiservice, mvp-prototype, security-regulated. |
| 2026-05-14 | Phase 1 | `node scripts/validate-template.mjs` | pass | Templates checked: 10; YAML files checked: 126. |
| 2026-05-14 | Phase 1 | `node scripts/create-project.mjs --list` | pass | Output included `production-agent-system` and matched `templates-index.yaml`. |
| 2026-05-14 | Phase 1 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Created `sample-agent.zip`; template variables replaced in 13 files; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 1 | `tar -tf sample-agent.zip` | pass | Confirmed generated archive includes `src`, `tools`, `evals`, `memory`, `observability`, `security`, `deploy`, `harness`, and `tests` structure. |
| 2026-05-14 | Phase 2 | `node scripts/validate-template.mjs` | pass | Templates checked: 10; YAML files checked: 126. |
| 2026-05-14 | Phase 2 | `npm install` | fail | PowerShell blocked `npm.ps1` by execution policy. Retried with `npm.cmd`. |
| 2026-05-14 | Phase 2 | `npm.cmd install` | pass | Escalated network access was required after sandbox timeout; added 3 packages and found 0 vulnerabilities. |
| 2026-05-14 | Phase 2 | `npm.cmd run build` | pass | TypeScript runtime skeleton compiled successfully. |
| 2026-05-14 | Phase 2 | `npm.cmd run test` | fail | Initial script used `node --test dist/tests`, which Node treated as a module path on Windows. Updated script to `node --test dist/tests/*.test.js`. |
| 2026-05-14 | Phase 2 | `npm.cmd run test` | pass | Runtime tests passed: 6 tests, 0 failures. |
| 2026-05-14 | Phase 2 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after cleanup; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 2 | `tar -tf sample-agent.zip` | pass | Confirmed archive includes runtime files and excludes generated `node_modules` and `dist` directories. |
| 2026-05-14 | Phase 2 | `npm.cmd run build` | fail | A final build was attempted after cleanup, so `tsc` was unavailable because `node_modules` had been removed. Reran `npm.cmd install` before final build/test. |
| 2026-05-14 | Phase 2 | `npm.cmd install` | pass | Reinstalled 3 packages for final local verification. |
| 2026-05-14 | Phase 2 | `npm.cmd run build` | pass | Final TypeScript build passed. |
| 2026-05-14 | Phase 2 | `npm.cmd run test` | pass | Final runtime tests passed: 6 tests, 0 failures. |
| 2026-05-14 | Phase 2 | `node scripts/validate-template.mjs` | pass | Final template validation passed: 10 templates, 126 YAML files. |
| 2026-05-14 | Phase 3 | `npm.cmd install` | pass | Installed existing template dev dependencies for local verification. |
| 2026-05-14 | Phase 3 | `npm.cmd run build` | pass | TypeScript compiled tool registry, approval gate, schema validation, audit, and redaction code. |
| 2026-05-14 | Phase 3 | `npm.cmd run validate:tools` | pass | Tool registry validation passed. |
| 2026-05-14 | Phase 3 | `node scripts/validate-template.mjs` | pass | Templates checked: 10; YAML files checked: 126. |
| 2026-05-14 | Phase 3 | `npm.cmd run test` | pass | Runtime and tool tests passed: 10 tests, 0 failures. |
| 2026-05-14 | Phase 3 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after cleanup; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 3 | `tar -tf sample-agent.zip` | pass | Confirmed archive includes `scripts/validate-tools.mjs`, `src/tools/*`, built-in tools, audit/redaction hooks, and excludes generated `node_modules` and `dist`. |
| 2026-05-14 | Phase 4 | `npm.cmd install` | pass | Installed existing template dev dependencies for local verification. |
| 2026-05-14 | Phase 4 | `npm.cmd run build` | pass | TypeScript compiled memory store, memory policy, checkpoint store, and conversation store code. |
| 2026-05-14 | Phase 4 | `npm.cmd run validate:tools` | pass | Tool registry validation still passed after memory changes. |
| 2026-05-14 | Phase 4 | `node scripts/validate-template.mjs` | pass | Templates checked: 10; YAML files checked: 126. |
| 2026-05-14 | Phase 4 | `npm.cmd run test` | pass | Runtime, tool, and memory tests passed: 13 tests, 0 failures. |
| 2026-05-14 | Phase 4 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after cleanup; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 4 | `tar -tf sample-agent.zip \| Select-String -Pattern 'src/memory\|tests/memory.test.ts\|node_modules\|dist'` | pass | Confirmed generated archive includes `src/memory/*` and `tests/memory.test.ts`; no `node_modules` or `dist` matches were present. |
| 2026-05-14 | Phase 5 | `npm.cmd install` | pass | Installed existing template dev dependencies for local verification. |
| 2026-05-14 | Phase 5 | `npm.cmd run build` | pass | TypeScript compiled eval loader, scorers, runner, and report writer. |
| 2026-05-14 | Phase 5 | `npm.cmd run validate:tools` | pass | Tool registry validation still passed after eval changes. |
| 2026-05-14 | Phase 5 | `node scripts/validate-template.mjs` | pass | Templates checked: 10; YAML files checked: 129. |
| 2026-05-14 | Phase 5 | `npm.cmd run test` | pass | Runtime, tool, memory, and eval tests passed: 16 tests, 0 failures. |
| 2026-05-14 | Phase 5 | `npm.cmd run eval:smoke` | pass | Smoke eval passed with mock provider: score 1.000. |
| 2026-05-14 | Phase 5 | `npm.cmd run eval` | pass | Full eval suite passed with mock provider: refusal, regression, smoke, tool-use all scored 1.000. |
| 2026-05-14 | Phase 5 | `node dist/src/evals/eval-runner.js --dataset failing-threshold` | fail expected | Temporary dataset with threshold 1.1 returned exit code 1 and score 1.000, confirming threshold failure behavior. Temporary dataset and generated reports were removed. |
| 2026-05-14 | Phase 5 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after cleanup; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 5 | `tar -tf sample-agent.zip \| Select-String -Pattern 'src/evals\|evals/datasets\|evals/scorers\|tests/evals.test.ts\|evals/reports/.+-latest\|node_modules\|dist'` | pass | Confirmed eval source/datasets/scorers/tests are included; generated reports, `node_modules`, and `dist` were not present. |
| 2026-05-14 | Phase 6 | `npm.cmd install` | pass | Installed existing template dev dependencies for local verification. |
| 2026-05-14 | Phase 6 | `npm.cmd run build` | pass | TypeScript compiled tracer, logger, metrics, audit, redaction, and observability integrations. |
| 2026-05-14 | Phase 6 | `npm.cmd run validate:tools` | pass | Tool registry validation still passed after observability changes. |
| 2026-05-14 | Phase 6 | `node scripts/validate-template.mjs` | pass | Templates checked: 10; YAML files checked: 129. |
| 2026-05-14 | Phase 6 | `npm.cmd run test` | pass | Runtime, tool, memory, eval, and observability tests passed: 21 tests, 0 failures. |
| 2026-05-14 | Phase 6 | `npm.cmd run eval:smoke` | pass | Smoke eval passed with mock provider: score 1.000. |
| 2026-05-14 | Phase 6 | `npm.cmd run eval` | pass | Full eval suite passed with mock provider: refusal, regression, smoke, tool-use all scored 1.000. |
| 2026-05-14 | Phase 6 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after cleanup; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 6 | `tar -tf sample-agent.zip \| Select-String -Pattern 'src/observability\|tests/observability.test.ts\|node_modules\|dist\|evals/reports/.+-latest'` | pass | Confirmed observability source/tests are included; generated reports, `node_modules`, and `dist` were not present. |
| 2026-05-14 | Phase 7 | `npm.cmd install` | pass | Installed existing template dev dependencies for local verification. |
| 2026-05-14 | Phase 7 | `npm.cmd run build` | pass | TypeScript compiled policy engine, approval gate, data classifier, secret redactor, and prompt injection check. |
| 2026-05-14 | Phase 7 | `npm.cmd run validate:tools` | pass | Tool registry validation still passed after security changes. |
| 2026-05-14 | Phase 7 | `node scripts/validate-template.mjs` | pass | Templates checked: 10; YAML files checked: 129. |
| 2026-05-14 | Phase 7 | `npm.cmd run test` | pass | Runtime, tool, memory, eval, observability, and security tests passed: 27 tests, 0 failures. |
| 2026-05-14 | Phase 7 | `npm.cmd run eval:smoke` | pass | Smoke eval passed with mock provider: score 1.000. |
| 2026-05-14 | Phase 7 | `npm.cmd run eval` | pass | Full eval suite passed with mock provider: refusal, regression, smoke, tool-use all scored 1.000. |
| 2026-05-14 | Phase 7 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after cleanup; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 7 | `tar -tf sample-agent.zip \| Select-String -Pattern 'src/security\|tests/security.test.ts\|node_modules\|dist\|evals/reports/.+-latest'` | pass | Confirmed security source/tests are included; generated reports, `node_modules`, and `dist` were not present. |
| 2026-05-14 | Phase 8 | `npm.cmd install` | pass | Installed existing template dev dependencies for local verification. |
| 2026-05-14 | Phase 8 | `npm.cmd run build` | pass | TypeScript compiled API server, healthcheck, env validation, worker queue, and deployment tests. |
| 2026-05-14 | Phase 8 | `node scripts/validate-template.mjs` | pass | Templates checked: 10; YAML files checked: 129. |
| 2026-05-14 | Phase 8 | `npm.cmd run test` | pass | Runtime, API, deployment, eval, memory, observability, security, and tool tests passed: 33 tests, 0 failures. |
| 2026-05-14 | Phase 8 | `npm.cmd run validate:tools` | pass | Tool registry validation still passed after deployment changes. |
| 2026-05-14 | Phase 8 | `npm.cmd run eval:smoke` | pass | Smoke eval passed with mock provider: score 1.000. |
| 2026-05-14 | Phase 8 | `npm.cmd run eval` | pass | Full eval suite passed with mock provider: refusal, regression, smoke, tool-use all scored 1.000. |
| 2026-05-14 | Phase 8 | `npm.cmd run healthcheck` | pass | Started local API on `127.0.0.1:3109`; healthcheck returned `Healthcheck passed`. |
| 2026-05-14 | Phase 8 | `npm.cmd run docker:build` | fail | Initial sandboxed Docker daemon access failed with permission denied on `npipe:////./pipe/docker_engine`; reran with approved escalation. |
| 2026-05-14 | Phase 8 | `npm.cmd run docker:build` | pass | Docker image `production-agent-system:local` built successfully after adding `.dockerignore` and runtime `npm ci --omit=dev`; final context was 172.53kB. |
| 2026-05-14 | Phase 8 | `docker compose -f deploy/docker-compose.yml config` | pass | Compose file rendered API and worker services with env, healthcheck, ports, and shared image configuration. |
| 2026-05-14 | Phase 8 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after cleanup; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 8 | `tar -tf sample-agent.zip \| Select-String -Pattern 'src/api/health\|src/api/healthcheck\|src/workers/queue\|tests/api.test.ts\|tests/deployment.test.ts\|.dockerignore\|deploy/Dockerfile\|deploy/docker-compose.yml\|node_modules\|dist\|evals/reports/.+-latest\|.docker-tmp'` | pass | Confirmed deployment source/tests/Docker files are included; generated artifacts were not present. |
| 2026-05-14 | Phase 9 | `npm.cmd run test:generator` | fail | Initial generator test used `execFileSync("npm.cmd")`; Node returned `EINVAL` on Windows before generated-project npm install. Updated the test to invoke npm through `npm_execpath` / `npm-cli.js`. |
| 2026-05-14 | Phase 9 | `npm.cmd run test:generator` | pass | Golden snapshot test passed: generated file list matched snapshot, no unresolved placeholders were found, generated project passed `validate-tools`, `npm install`, `build`, `test`, and `eval:smoke`. |
| 2026-05-14 | Phase 9 | `npm.cmd run validate` | pass | Root validation script passed: templates checked 10; YAML files checked 129; generator snapshot harness files and script were present. |
| 2026-05-14 | Phase 9 | `node scripts/validate-template.mjs` | pass | Direct validation command passed: templates checked 10; YAML files checked 129. |
| 2026-05-14 | Phase 9 | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after Phase 9 docs and snapshot changes; no unresolved placeholder list was reported. |
| 2026-05-14 | Phase 9 | `tar -tf sample-agent.zip \| Select-String -Pattern 'tests/snapshots/production-agent-system-file-list.txt\|tests/generator.test.mjs\|examples/generated-production-agent-system\|src/index.ts\|node_modules\|dist\|.tmp-generator-\|evals/reports/.+-latest'` | pass | Confirmed generated project includes template runtime file `src/index.ts`; upstream generator test artifacts and generated build artifacts were not included. |
| 2026-05-14 | Final hardening | `npm.cmd run test:generator` | pass | Generator snapshot test passed after adding generated-project `validate:structure`; generated project passed structure validation, tool validation, install, build, test, and smoke eval. |
| 2026-05-14 | Final hardening | `npm.cmd run validate` | pass | Root validation passed after generator harness and structure validation updates: templates checked 10; YAML files checked 129. |
| 2026-05-14 | Final hardening | `npm.cmd install` | pass | Installed existing production-agent-system dev dependencies for final local verification. |
| 2026-05-14 | Final hardening | `npm.cmd run build` | pass | TypeScript compiled successfully after adding `scripts/validate-structure.mjs`. |
| 2026-05-14 | Final hardening | `npm.cmd run validate:structure` | fail expected | Running generated-project structure validation against the template source failed because template source intentionally contains `{{...}}` placeholders. Removed the CI step that incorrectly ran this command in the template source; generator test runs it in the generated project. |
| 2026-05-14 | Final hardening | `npm.cmd run validate:tools` | pass | Tool registry validation passed after final hardening changes. |
| 2026-05-14 | Final hardening | `npm.cmd run test` | pass | Production-agent-system tests passed: 33 tests, 0 failures. |
| 2026-05-14 | Final hardening | `npm.cmd run eval:smoke` | pass | Smoke eval passed with mock provider: score 1.000. |
| 2026-05-14 | Final hardening | `npm.cmd run eval` | pass | Full eval suite passed with mock provider: refusal, regression, smoke, tool-use all scored 1.000. |
| 2026-05-14 | Final hardening | `npm.cmd run healthcheck` | pass | Started local API on `127.0.0.1:3110`; healthcheck returned `Healthcheck passed`. |
| 2026-05-14 | Final hardening | `npm.cmd run docker:build` | pass | Docker image `production-agent-system:local` built successfully with context 175.95kB after approved Docker daemon access. |
| 2026-05-14 | Final hardening | `docker compose -f deploy/docker-compose.yml config` | pass | Compose config rendered API and worker services with healthcheck and env configuration. |
| 2026-05-14 | Final hardening | `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force` | pass | Regenerated `sample-agent.zip` after final hardening updates; no unresolved placeholder list was reported. |
| 2026-05-14 | Final hardening | `tar -tf sample-agent.zip \| Select-String -Pattern 'scripts/validate-structure.mjs\|src/index.ts\|node_modules\|dist\|.tmp-generator-\|evals/reports/.+-latest\|.docker-tmp'` | pass | Confirmed generated project includes `scripts/validate-structure.mjs` and excludes generated artifacts. |
