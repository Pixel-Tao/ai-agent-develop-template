# Template Scripts

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

This folder contains scripts for project archive generation and template variable replacement. The scripts use Node.js or PowerShell built-ins and do not require npm package installation.

## Recommended: Create a Project Archive

Node.js 18 or later is required.

Interactive mode:

```bash
node scripts/create-project.mjs
```

Command mode:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-name my-project --owner-name "project-owner"
```

Use separate project id and display name:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-id tao-crm --project-name "TAO CRM" --owner-name TAO
```

The generator:

1. Selects a template.
2. Validates that the project name is safe for filenames and paths.
3. Reads the owner name.
4. Uses the run date for date placeholders.
5. Copies the template and replaces variables.
6. Creates a root-level zip archive such as `my-project.zip`.

Use `--force` to overwrite an existing archive.

## List Templates

```bash
node scripts/create-project.mjs --list
```

## Validate Templates

```bash
npm run validate
```

## Generator Regression Test

```bash
npm run test:generator
```

Run all-template smoke tests and delivery package tests:

```bash
npm run test:generator:all
npm run test:delivery
```

## Delivery Sanitization

Create a clean package that excludes Agent operational materials before delivery:

```bash
node scripts/archive-agent-workspace.mjs --policy delivery/sanitize-policy.yaml --output dist/internal-archive
node scripts/create-delivery-package.mjs --policy delivery/sanitize-policy.yaml --output dist/delivery
node scripts/validate-delivery-clean.mjs --package dist/delivery/project-delivery.zip --policy delivery/sanitize-policy.yaml
```

Safely apply a template to an existing project:

```bash
node scripts/apply-template.mjs --template existing-project-onboarding --target ../existing-project --dry-run
```
