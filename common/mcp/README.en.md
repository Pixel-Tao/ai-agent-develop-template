# MCP Control

## Purpose

This common structure helps projects review, approve, and record MCP (Model Context Protocol) servers and external capabilities during initialization.

## Principles

- MCP servers are not auto-installed or auto-started by default.
- MCPs can access external systems, local files, credentials, and customer data, so they require stricter review than Skills.
- Every candidate must declare purpose, risk level, transport, access scope, credential needs, and approval status.
- Unapproved MCPs must not be activated.
- Runtime logs, local config, and selection logs should be excluded from delivery packages or marked review_required.

## Files

- `mcp-policy.template.yaml`: MCP usage policy template
- `mcp-servers.template.yaml`: MCP candidate server template
- `mcp-selection-guide.md`: Candidate selection workflow
- `mcp-security-checklist.md`: Security review checklist
- `validation-rules.md`: Rules enforced by validation

## Recommended Flow

1. Identify required external capabilities.
2. Research MCP candidates and record them in `mcp/mcp-servers.yaml`.
3. Review risk, credentials, data scope, and allowed/denied operations.
4. Activate only approved MCPs.
5. Record decisions in `mcp/mcp-selection-log.md` and the run log.
