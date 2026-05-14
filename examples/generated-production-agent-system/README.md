# Generated Production Agent System Example

This directory documents the generated example covered by the Phase 9 golden snapshot test.

The checked-in golden file list lives at:

- `tests/snapshots/production-agent-system-file-list.txt`

Regenerate and verify the example with:

```bash
npm run test:generator
```

The test creates a temporary generated project, compares its file list against the snapshot, checks unresolved placeholders, runs template-local validation without installing dependencies, then runs `npm install`, `npm run build`, `npm run test`, and `npm run eval:smoke` inside the generated project.
