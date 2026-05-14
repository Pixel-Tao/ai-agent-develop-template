# Agent Project Templates

Korean is the default documentation language. This file is the English companion for [README.md](README.md).
See [docs/localization.en.md](docs/localization.en.md) for the documentation language policy.

This repository provides reusable project templates that help AI agents quickly understand a project's goals, structure, roles, working state, and collaboration rules. It is not product code; it is a starting structure that can be copied into different projects.

## Requirements

- Node.js 18 or later.
- Project archives are created with `scripts/create-project.mjs`.
- Project names may be free-form, but path-unsafe filename characters are rejected.

## Quick Start

Interactive mode:

```bash
node scripts/create-project.mjs
```

Command mode:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-name my-project --owner-name "project-owner"
```

The command creates `my-project.zip` in the repository root. Files are placed at the archive root, not inside an extra `my-project/` directory.

## Validation

Validate template registry entries, required files, YAML basics, template ids, placeholders, and generator configuration:

```bash
npm run validate
```

List templates known to the generator:

```bash
node scripts/create-project.mjs --list
```

Run the production-agent-system generator regression test:

```bash
npm run test:generator
```

GitHub Actions runs the same validation workflow.

## Templates

| Template ID | Use case | Key traits |
|---|---|---|
| `greenfield-basic` | New small projects | Basic AI-agent friendly project structure |
| `existing-project-onboarding` | Existing codebases | Codebase discovery and risk analysis |
| `large-team-collaboration` | Larger teams | Role-based agents, ownership, approvals |
| `legacy-modernization` | Legacy improvement or migration | Behavior preservation and migration planning |
| `mvp-prototype` | Fast MVPs | Lightweight planning and feedback loops |
| `monorepo-multiservice` | Monorepos and multi-service systems | Service and package ownership |
| `security-regulated` | Security or compliance-heavy projects | Audit, approvals, control mapping |
| `maintenance-operations` | Operating services | Runbooks, incidents, releases |
| `ai-data-project` | AI/data/LLM projects | Data, model, prompt, and evaluation docs |
| `production-agent-system` | Production AI agent services | Runtime, tools, memory, evals, tracing, security, deployment |

## Language Policy

- Korean documentation is the source of truth.
- English companion files use the `.en.md` suffix.
- New top-level guides and template entrypoint READMEs should include both Korean and English versions.
