# Production Agent System

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

## Purpose

An executable system template for building production AI agent services. It separates API server, worker, tool calling, memory, evals, observability, security, and deployment concerns in one generated project.

## Use When

- You need a real AI agent API server.
- The agent uses tool calling.
- RAG, workflows, or background workers are needed.
- Eval, tracing, audit, and deployment structures are required.
- The agent is intended for an operational deployment path.

## Do Not Use When

- You only need document cleanup.
- You need a lightweight MVP documentation template.
- The application does not need an agent runtime.

## Initialization

1. Check project metadata in `manifest.yaml`.
2. Read `AGENTS.md` for runtime, tool, memory, and security rules.
3. Review `harness/commands.md` and separate confirmed commands from project-specific setup.
4. Record current status in `docs/09_agent_state/current-status.md`.
5. Keep runtime, tests, evals, and deployment commands executable.

## Runtime Commands

```bash
npm install
npm run validate:structure
npm run build
npm run test
npm run validate:tools
npm run eval:smoke
npm run eval
npm run dev
npm run worker:dev
npm run healthcheck
npm run docker:build
```

`npm run healthcheck` requires the API server to be running and the project to be built.

## Main Structure

- `src/`: agent runtime, API, worker, tools, guardrails, memory, observability, and security code
- `tools/`: tool registry and permission model
- `memory/`: memory namespace, retention, and checkpoint policy
- `evals/`: datasets, scorers, and reports
- `observability/`: tracing, logging, metrics, and redaction policy
- `security/`: data classification, approval, prompt injection, secret, and threat model policy
- `deploy/`: Docker, compose, environment, deployment, and healthcheck docs
- `harness/`: command inventory, verification matrix, and evidence log
