# Legacy Modernization

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

## Purpose

A structure for improving, refactoring, or migrating legacy projects while preserving existing behavior.

## Use When

- The codebase is old or hard to change
- Test coverage is missing in important areas
- A technology stack transition is planned

## Do Not Use When

- The project is being built from scratch
- Behavior preservation is not important

## Initialization

1. Fill project metadata in `manifest.yaml`.
2. Document current architecture and fragile areas.
3. Define characterization tests and rollback strategy before risky changes.
4. Record current state in `docs/09_agent_state/current-status.md`.

## Required Entrypoints

- `README.md`
- `AGENTS.md`
- `manifest.yaml`
- `template.yaml`
- `validation-checklist.md`
- `docs/09_agent_state/current-status.md`
