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
