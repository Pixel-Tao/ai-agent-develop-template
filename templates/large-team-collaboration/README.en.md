# Large Team Collaboration

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

## Purpose

A role-based project structure for larger teams that need explicit ownership, coordination, review, and approval flows.

## Use When

- Multiple roles or teams collaborate
- Work ownership must be separated
- Approvals and handoffs matter

## Do Not Use When

- This is a one-person project
- The project cannot afford the document maintenance cost

## Initialization

1. Fill project metadata in `manifest.yaml`.
2. Review the router `AGENTS.md` and role-specific `agents/*.md` files.
3. Record current state in `docs/09_agent_state/current-status.md`.
4. Assign work through the backlog, sprint plan, dependency board, and work allocation docs.

## Required Entrypoints

- `README.md`
- `AGENTS.md`
- `agents/README.md`
- `manifest.yaml`
- `validation-checklist.md`
- `docs/09_agent_state/current-status.md`
