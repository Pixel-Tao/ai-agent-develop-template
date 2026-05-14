# Tool Registry

This folder defines tool metadata and permission policy for Agent tool calling. Code implementations live under `src/tools/`.

Every tool must define:

- name
- description
- input_schema
- output_schema
- risk_level
- approval policy

High and destructive tools must require human approval before execution.

## Validation

Run this command after editing tool metadata or implementations:

```bash
npm run validate:tools
```

The validator checks tool metadata, implementation file paths, schema presence, risk levels, and approval policy coverage.
