# Security Regulated

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

## Purpose

A project structure for systems with important security, privacy, audit, or compliance requirements.

## Use When

- The project processes personal information
- Payment, finance, healthcare, public-sector, or other regulated data is involved
- Audit evidence and approvals are required

## Do Not Use When

- The project has no meaningful compliance requirements
- A lightweight internal tool is enough

## Initialization

1. Fill project metadata in `manifest.yaml`.
2. Review security, compliance, and approval policies.
3. Map controls and evidence requirements before implementation.
4. Record current state in `docs/09_agent_state/current-status.md`.

## Required Entrypoints

- `README.md`
- `AGENTS.md`
- `manifest.yaml`
- `template.yaml`
- `validation-checklist.md`
- `compliance/README.md`
- `security/README.md`
