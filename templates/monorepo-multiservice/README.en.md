# Monorepo Multiservice

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

## Purpose

A structure for monorepos and multi-service systems where service ownership, package dependencies, and integration contracts must be explicit.

## Use When

- The project is a monorepo
- Multiple services or packages are maintained together
- Shared package ownership and release coordination matter

## Do Not Use When

- The project is a single small app
- Service boundaries are not yet meaningful

## Initialization

1. Fill project metadata in `manifest.yaml`.
2. Map packages, services, owners, and dependencies.
3. Review role-specific agents for service, package, integration, platform, and release work.
4. Record current state in `docs/09_agent_state/current-status.md`.

## Required Entrypoints

- `README.md`
- `AGENTS.md`
- `manifest.yaml`
- `template.yaml`
- `validation-checklist.md`
- `docs/09_agent_state/current-status.md`
