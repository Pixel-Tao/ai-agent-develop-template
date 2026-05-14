# Template Decision Guide

Korean is the default documentation language. This file is the English companion for [decision-guide.md](decision-guide.md).

## Quick Selection

| Situation | Template |
|---|---|
| A small project starting from scratch | `greenfield-basic` |
| A project with existing code | `existing-project-onboarding` |
| Five or more contributors, role separation, approvals | `large-team-collaboration` |
| Legacy improvement or migration | `legacy-modernization` |
| Fast MVP or prototype | `mvp-prototype` |
| Monorepo or multiple services | `monorepo-multiservice` |
| Security, privacy, audit, or compliance requirements | `security-regulated` |
| Maintaining an operating service | `maintenance-operations` |
| AI, data, LLM, or evaluation experiments | `ai-data-project` |
| Production agent API, worker queue, tool calling, memory, evals, tracing, Docker deployment | `production-agent-system` |

## Selection Questions

1. Is this a new project or an existing codebase?
2. How many people or agents will work on it?
3. Is role separation or approval flow required?
4. Are security, privacy, audit, or compliance requirements important?
5. Does the project include AI, data, model, prompt, or evaluation work?
6. Does it require production operations, incident handling, release management, or rollback?
7. Is an executable AI agent service runtime required?

## Practical Guidance

Start with the closest template, then merge specialized folders only when the project actually needs them. Avoid choosing a heavy template only because it looks more complete.

Use `production-agent-system` when you need an executable AI agent service template, not just project documentation. If you are adding an agent to an existing product, start with `existing-project-onboarding` to understand the current system, then merge the runtime, tool, eval, security, and deployment pieces you need.
