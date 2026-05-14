# Harness Commands

This document separates confirmed commands from project-specific commands that must be filled during generated project initialization.

## Command Inventory

| Command ID | Purpose | Command | Run location | Input | Output | Status | Notes |
|---|---|---|---|---|---|---|---|
| install | install dependencies | `npm install` | project root | package.json | node_modules | active | Required before build/test. |
| template-structure | generated template structure check | `npm run validate:structure` | project root | template.yaml required_files and generated files | validation output | active | Checks required files and unresolved placeholders without external dependencies. |
| runtime-test | runtime tests | `npm run test` | project root | src and tests | test output | active | Runs build and Node test runner. |
| tool-validation | tool registry validation | `npm run validate:tools` | project root | tools registry | validation output | active | Validates metadata, implementation paths, schemas, risk levels, and approval policy. |
| memory-test | memory and checkpoint tests | `npm run test` | project root | src/memory and tests/memory.test.ts | test output | active | Covers namespace separation, policy denial, and checkpoint resume. |
| eval-smoke | smoke eval | `npm run eval:smoke` | project root | evals/datasets/smoke.yaml | evals/reports/smoke-latest.* | active | Runs mock-provider smoke eval without API keys. |
| eval-full | full eval suite | `npm run eval` | project root | evals/datasets/*.yaml | evals/reports/*-latest.* | active | Runs smoke, tool-use, refusal, and regression datasets. |
| observability-test | observability tests | `npm run test` | project root | src/observability and tests/observability.test.ts | test output | active | Covers trace, structured log, metrics, audit events, and redaction. |
| security-test | security policy tests | `npm run test` | project root | src/security and tests/security.test.ts | test output | active | Covers classifier, redaction, prompt injection, approval gate, and policy failure behavior. |
| build | TypeScript build | `npm run build` | project root | src and tests | dist | active | Compiles TypeScript runtime skeleton. |
| api-dev | local API server | `npm run dev` | project root | deploy/env.example or process env | running API server | active | Builds and starts the API server with graceful shutdown. |
| worker-dev | local worker | `npm run worker:dev` | project root | deploy/env.example or process env | running worker process | active | Builds and starts the background worker loop. |
| healthcheck | API healthcheck | `npm run healthcheck` | project root | running API and dist build | HTTP response | active | Checks `GET /healthz`; run after `npm run build` and while the API server is running. |
| docker-build | local Docker image build | `npm run docker:build` | project root | Docker daemon and package lock | container image | active | Builds the production-agent-system image from deploy/Dockerfile. |
| docker-compose | local container stack | `docker compose -f deploy/docker-compose.yml up --build` | project root | Docker daemon | API and worker containers | active | Starts API and worker services using env.example. |

## Execution Rules

- Record command, timestamp, result, and failure cause.
- Do not report a draft command as passing.
- Approval-required operations must reference an approval record.
