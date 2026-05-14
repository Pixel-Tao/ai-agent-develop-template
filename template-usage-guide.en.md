# Template Usage Guide

Korean is the default documentation language. This file is the English companion for [template-usage-guide.md](template-usage-guide.md).

## 1. Prepare

Install Node.js 18 or later. The generator uses only built-in Node.js functionality and does not require extra npm packages.

## 2. Choose a Template

Use [decision-guide.en.md](decision-guide.en.md) to choose the closest template. If uncertain, start with the closest base template and merge specialized folders later.

## 3. Create a Project Archive

Interactive mode:

```bash
node scripts/create-project.mjs
```

Command mode:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-name my-project --owner-name "project-owner"
```

Production agent system example:

```bash
node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name "project-owner" --force
```

Project names may be free-form, but characters unsafe for filenames or paths are rejected. If no date is provided, the generator replaces `{{YYYY-MM-DD}}` with the run date.

## 4. Add Initial Project Inputs

Put planning notes, draft requirements, sketches, meeting notes, and reference links into `inputs/initial-development-docs/` or `inputs/references/` in the generated project. The archive places project files at the archive root.

## 5. Verify Agent Entrypoints

Before work starts, agents should read:

- `AGENTS.md`
- `manifest.yaml`
- `inputs/source-documents-index.md`
- `docs/09_agent_state/current-status.md`

Role-based templates may also include `agents/*.md` files.

## 6. Run Validation

For `production-agent-system`, run:

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

At the repository root, run:

```bash
npm run validate
npm run test:generator
```

## 7. Language Policy

Korean is the default documentation language. English companion documents use `.en.md`. Add English companions for new top-level guides and template entrypoint READMEs.
