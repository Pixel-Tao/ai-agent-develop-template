# Agent Project Templates

Korean is the default documentation language. This file is the English companion for [README.md](README.md).
See [docs/localization.en.md](docs/localization.en.md) for the documentation language policy.

This repository provides project templates that help AI agents quickly understand a project's goals, structure, roles, working state, and collaboration rules. It is not a product-code repository; it provides AI-agent-friendly starting structures that can be copied into new or existing projects.

The repository currently includes 10 templates, a project zip generator, Delivery Sanitization, a template validator, generator regression tests, Korean source documentation, and English sidecar documentation.

## Scope

- AI-agent working structures for different project types
- Agent entrypoints based on `AGENTS.md`, `CLAUDE.md`, `INIT.md`, and `manifest.yaml`
- Document skeletons for requirements, design, tasks, decisions, and state tracking
- Initial source-material intake through `inputs/`
- skills.sh discovery and installation planning through `skills/skills-sh-recommendations.yaml`
- Command, verification, and evidence tracking through `harness/`
- Common skills and template-specific skills
- Project zip generation and template variable replacement
- Delivery Sanitization for clean customer packages and internal archives
- Validation for template structure, YAML, placeholders, and English companion documents
- Golden snapshot regression testing for generated `production-agent-system` projects

## Requirements

- Node.js 18 or later
- The default generator and validator run without additional npm dependencies.
- Projects generated from `production-agent-system` need TypeScript development dependencies installed before build and test commands can run.

## Quick Start

List available templates:

```bash
node scripts/create-project.mjs --list
```

Create a project zip interactively:

```bash
node scripts/create-project.mjs
```

Create a project zip with explicit values. `--project-id` is used for filenames and manifest ids, while `--project-name` is the display name:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-id my-project --project-name "My Project" --owner-name "project-owner"
```

Create a production AI Agent system project:

```bash
node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name "project-owner"
```

The output is `<project-name>.zip` in the repository root. Files are placed directly at the archive root, without an extra top-level project folder. Date placeholders are automatically replaced with the current `YYYY-MM-DD` value.

Use `--force` only when you want to overwrite an existing zip with the same name.

## Templates

| Template ID | Use case | Key traits | Recommended for |
|---|---|---|---|
| `greenfield-basic` | New small projects | Basic requirements, design, task, and state docs | Developers, Tech Leads |
| `existing-project-onboarding` | Existing codebases | Codebase discovery, risk areas, convention preservation | Developers, Tech Leads |
| `large-team-collaboration` | Larger role-based teams | Router AGENTS, role-based agents, RACI, workflows | PMs, Tech Leads, QA, DevOps |
| `legacy-modernization` | Legacy improvement or migration | Behavior preservation, characterization tests, rollback planning | Tech Leads, maintenance teams |
| `mvp-prototype` | Fast validation and MVPs | Lightweight docs, experiment planning, feedback tracking | PMs, founders, developers |
| `monorepo-multiservice` | Monorepos and multi-service systems | Service/package ownership and dependency management | Platform, DevOps |
| `security-regulated` | Security or compliance-heavy projects | Security review, audit evidence, approvals | Security, Compliance, Backend |
| `maintenance-operations` | Operating service maintenance | Runbooks, incident logs, release/rollback | SRE, DevOps, QA |
| `ai-data-project` | AI/data/LLM projects | Data, prompts, evaluation, experiment tracking | ML Engineers, Data Scientists |
| `production-agent-system` | Production AI Agent systems | Runtime, tool calling, memory, evals, tracing, security, API/worker deploy | AI Platform, Backend, DevOps |

See [decision-guide.en.md](decision-guide.en.md) for detailed selection guidance.

## Recommended Workflow

1. Choose a template with [decision-guide.en.md](decision-guide.en.md).
2. Create a zip with `node scripts/create-project.mjs`.
3. Extract the generated zip into the real project location.
4. Add planning docs, notes, draft requirements, sketches, and reference links under `inputs/`.
5. Ask the agent to run `init` or `/init`.
6. The agent reads `INIT.md`, `AGENTS.md`, `manifest.yaml`, `skills/skills-sh-recommendations.yaml`, and `harness/`, then runs the initial interview, skills.sh-based skill setup, and state setup.
7. Record implementation, verification, review, and release evidence in `harness/evidence-log.md` and `docs/09_agent_state/`.

## Generated Project Structure

| Path | Purpose |
|---|---|
| `README.md` | Purpose and usage of the generated project |
| `README.en.md` | English companion document |
| `AGENTS.md` | Agent working rules and priorities |
| `CLAUDE.md` | Entry instructions for Claude-family agents |
| `INIT.md` | First-run initialization procedure |
| `manifest.yaml` | Project and template metadata |
| `template.yaml` | Template definition and required files |
| `validation-checklist.md` | Post-generation checklist |
| `inputs/` | Initial development materials and references |
| `docs/` | Requirements, design, tasks, decisions, and state docs |
| `skills/` | Task-specific skills for agents |
| `skills/skills-sh-recommendations.yaml` | skills.sh search terms and recommended sources |
| `harness/` | Commands, verification matrix, and evidence log |
| `delivery/` | Delivery policy, manifest, checklists, and reports |
| `.deliveryignore` | Exclusion rules for delivery packages |
| `.agentignore` | Active-context exclusion rules after delivery preparation |

Some templates add domain folders such as `agents/`, `workflows/`, `security/`, `operations/`, `evals/`, or `deploy/`.

## Delivery Sanitization

After development is complete, a customer delivery package may need to include only source code, tests, required documentation, licenses, and deployment artifacts while excluding Agent operational materials. This repository provides a workflow that creates a separate clean package and internal archive without deleting the original working repository.

```bash
node scripts/archive-agent-workspace.mjs --policy delivery/sanitize-policy.yaml --output dist/internal-archive
node scripts/create-delivery-package.mjs --policy delivery/sanitize-policy.yaml --output dist/delivery
node scripts/validate-delivery-clean.mjs --package dist/delivery/<package>.zip --policy delivery/sanitize-policy.yaml
```

The default policy excludes Agent operational materials such as `AGENTS.md`, `CLAUDE.md`, `INIT.md`, `skills/`, `harness/`, `inputs/`, and `docs/09_agent_state/` from delivery packages. Materials with possible contractual, audit, security, or license retention obligations are archived or marked for review rather than deleted.

## Production Agent System

`production-agent-system` is an executable template for building real AI Agent services. It includes a TypeScript skeleton in addition to documentation structure.

Included capabilities:

- Agent runtime and run lifecycle
- API server, `/healthz`, `/agent/run`
- Background worker queue
- Tool registry, schema validation, permissions, and approval gates
- Memory namespaces, checkpoints, and write policies
- Eval datasets, scorers, and eval runner
- Traces, structured logs, metrics, audit events, and redaction
- Data classification, secret redaction, prompt-injection checks, and security policy
- Dockerfile, Docker Compose, env validation, and healthcheck
- Generator golden snapshot regression coverage

Common commands inside a generated project:

```bash
npm install
npm run validate:structure
npm run build
npm run test
npm run validate:tools
npm run eval:smoke
npm run eval
npm run docker:build
```

The default skeleton uses a mock provider, so basic build, tests, and smoke evals can run without an API key. For production use, replace the provider, memory store, observability sink, secret handling, and deployment environment according to the project requirements.

## Repository Validation

Validate all templates from the repository root:

```bash
npm run validate
```

Validation checks:

- `templates-index.yaml` matches the actual `templates/` directories
- Required files exist for each template
- IDs match across `manifest.yaml`, `template.yaml`, and `templates-index.yaml`
- YAML has a valid basic structure
- Unsupported `{{PLACEHOLDER}}` values are not used
- Required English companion documents exist
- Generator list output matches the template index

Run the generated `production-agent-system` snapshot test:

```bash
npm run test:generator
```

The GitHub Actions workflow in `.github/workflows/validate.yml` runs the same validation flow.

## Scripts

| Command | Description |
|---|---|
| `node scripts/create-project.mjs --list` | List templates available to the generator with short summaries |
| `node scripts/create-project.mjs` | Create a project zip interactively |
| `node scripts/create-project.mjs --template <id> --project-name <name> --owner-name <owner>` | Create a project zip with explicit values |
| `node scripts/create-project.mjs --template <id> --project-id <id> --project-name <name> --owner-name <owner>` | Create a project zip with separate id and display name |
| `node scripts/validate-template.mjs` | Validate the template repository |
| `node scripts/create-delivery-package.mjs --policy <file> --output <dir>` | Create a clean delivery package |
| `node scripts/archive-agent-workspace.mjs --policy <file> --output <dir>` | Create an internal archive of Agent operational materials |
| `node scripts/validate-delivery-clean.mjs --package <zip> --policy <file>` | Validate a clean delivery package |
| `node scripts/apply-template.mjs --template <id> --target <dir> --dry-run` | Safely apply a template to an existing project |
| `npx skills add <owner/repo>` | Install an external Skill reviewed through skills.sh |
| `npm run validate` | Run the validator |
| `npm run test:generator` | Run the generated project snapshot test |
| `npm run test:generator:all` | Run smoke tests for all generated templates |
| `npm run test:delivery` | Run delivery package tests for all templates |
| `npm run test:skills` | Test skills.sh recommendation files for all templates |
| `node scripts/replace-template-variables.mjs --root <path> --variables-file <file> --apply` | Replace variables in an already copied project |

See [scripts/README.en.md](scripts/README.en.md) for details.

## Documentation Language Policy

- Korean documentation is the default and acts as the source of truth.
- English documentation is provided as `.en.md` sidecar files in the same location.
- Root guides and template entrypoint READMEs are maintained in both Korean and English.
- Detailed domain docs, skill examples, and checklists remain Korean by default; add `.en.md` files in the same location when English coverage is needed.

## Related Documents

- [decision-guide.en.md](decision-guide.en.md): template selection guide
- [template-usage-guide.en.md](template-usage-guide.en.md): post-generation usage flow
- [template-notes.md](template-notes.md): template design notes
- [common/README.en.md](common/README.en.md): common files, documents, and skills
- [common/delivery/README.en.md](common/delivery/README.en.md): Delivery Sanitization policy and workflow
- [scripts/README.en.md](scripts/README.en.md): generation, validation, and replacement scripts
- [docs/localization.en.md](docs/localization.en.md): documentation language policy
