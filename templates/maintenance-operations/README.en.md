# Maintenance Operations

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

## Purpose

A structure for maintaining operating services, responding to incidents, and managing releases and patches.

## Use When

- The service is already in operation
- Incident response is part of the work
- Regular releases, patches, or rollback planning are required

## Do Not Use When

- The project has not been deployed yet
- Operational procedures are unnecessary for a one-off tool

## Initialization

1. Fill project metadata in `manifest.yaml`.
2. Review runbooks, monitoring, incident, and release documents.
3. Record service status and current work state.
4. Track changes through change requests and release plans.

## Required Entrypoints

- `README.md`
- `AGENTS.md`
- `manifest.yaml`
- `template.yaml`
- `validation-checklist.md`
- `operations/README.md`
