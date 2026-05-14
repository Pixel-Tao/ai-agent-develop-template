# Existing Project Onboarding

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

## Purpose

An onboarding structure for analyzing an existing codebase and safely introducing AI-agent workflows.

## Use When

- The project already has code
- Documentation is incomplete
- Change impact analysis is required before implementation

## Do Not Use When

- There is almost no code yet
- The work is a disposable prototype

## Initialization

1. Fill project metadata in `manifest.yaml`.
2. Read `AGENTS.md` and any role-specific agent files.
3. Record current state in `docs/09_agent_state/current-status.md`.
4. Inventory the repository, dependencies, tests, database, and APIs.
5. Document fragile areas and do-not-touch zones before changing code.

## Required Entrypoints

- `README.md`
- `AGENTS.md`
- `manifest.yaml`
- `template.yaml`
- `validation-checklist.md`
- `docs/09_agent_state/current-status.md`
