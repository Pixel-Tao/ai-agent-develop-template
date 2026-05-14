# Common Resources

Korean is the default documentation language. This file is the English companion for [README.md](README.md).

Common resources are reusable files, documents, skills, checklists, and snippets shared across templates. They keep document shape and AI-agent working rules consistent even when each template has a different structure.

## Structure

- `base-files/`: baseline README, AGENTS, manifest, and gitignore templates
- `base-docs/`: project overview, glossary, assumptions, decision log, run log, todo
- `base-skills/`: shared skill set
- `checklists/`: validation and release checklists
- `snippets/`: reusable templates for tasks, decisions, handoffs, risks, and reports

## Project Discovery

`common/base-docs/project-discovery-interview.md` is the shared interview format. The matching skill lives in `common/base-skills/project-discovery-interview`, and the final brief template lives in `common/snippets/project-definition-brief-template.md`.

## Initial Inputs

`common/base-inputs/` is the default place for planning notes, draft requirements, meeting notes, references, and sketches. Agents should index those materials before asking discovery questions.

## Harness Resources

`common/base-harness/` provides the baseline command inventory, verification matrix, evidence log, and runbook structure.
