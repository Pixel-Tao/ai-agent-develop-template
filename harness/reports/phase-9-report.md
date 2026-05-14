# Handoff Note: Phase 9

## Summary

Added generator-level golden snapshot coverage for `production-agent-system`. The repository now has a root `npm run test:generator` command that creates a generated archive, compares the generated file list to a committed snapshot, checks unresolved placeholders, extracts the generated project to a temporary directory, runs dependency-free tool validation, then runs `npm install`, `npm run build`, `npm run test`, and `npm run eval:smoke` inside the generated project.

## Changed Files

- `package.json`
- `package-lock.json`
- `.gitignore`
- `tests/generator.test.mjs`
- `tests/snapshots/production-agent-system-file-list.txt`
- `examples/generated-production-agent-system/README.md`
- `scripts/validate-template.mjs`
- `.github/workflows/validate.yml`
- `README.md`
- `scripts/README.md`
- `template-usage-guide.md`
- `templates/production-agent-system/README.md`
- `harness/evidence-log.md`

## Verified Commands

- `npm.cmd run test:generator`
  - Result: fail, then pass after fixing npm invocation on Windows.
  - Evidence: final run passed 1 generator test.
- `npm.cmd run validate`
  - Result: pass
  - Evidence: Templates checked: 10; YAML files checked: 129.
- `node scripts/validate-template.mjs`
  - Result: pass
  - Evidence: Templates checked: 10; YAML files checked: 129.
- `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force`
  - Result: pass
- `tar -tf sample-agent.zip | Select-String -Pattern 'tests/snapshots/production-agent-system-file-list.txt|tests/generator.test.mjs|examples/generated-production-agent-system|src/index.ts|node_modules|dist|.tmp-generator-|evals/reports/.+-latest'`
  - Result: pass
  - Evidence: generated project includes runtime files; upstream generator test artifacts and generated build artifacts are excluded.

## Known Gaps

- The golden snapshot covers file presence, unresolved placeholders, and smoke behavior, not byte-for-byte content snapshots.
- The generated-project smoke verification runs `eval:smoke`; full eval remains a separate template-level command.

## Assumptions

- File-list snapshots are the right granularity for generator regressions because template content changes frequently while missing/extra files are the highest-risk generator failure.
- Generated project dependency installation is acceptable in CI because the template already includes a lockfile and a tiny dependency set.

## Risks

- Snapshot updates are required whenever files are intentionally added to or removed from `production-agent-system`.
- Local `npm install` in the generated temp project can still fail if the machine has no npm registry access and no cache.

## Next Recommended Step

Move from phased implementation to final hardening: review all accumulated uncommitted changes, consider staging/commit strategy, and decide whether to add a PR-level summary.

## Evidence

- `harness/evidence-log.md`
