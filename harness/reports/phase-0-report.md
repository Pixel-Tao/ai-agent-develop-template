# Handoff Note: Phase 0

## Summary

Added repository-level template validation and CI wiring for the current template set. The new validator checks `templates-index.yaml`, required files, template id consistency, allowed placeholders, YAML file structure, and `create-project --list` consistency.

## Changed Files

- `scripts/validate-template.mjs`
- `.github/workflows/validate.yml`
- `README.md`
- `harness/evidence-log.md`
- `harness/reports/phase-0-report.md`

## Verified Commands

- `node scripts/validate-template.mjs`
  - Result: pass
  - Evidence: Templates checked: 9; YAML files checked: 115.
- `node scripts/create-project.mjs --list`
  - Result: pass
  - Evidence: Listed templates matched `templates-index.yaml`.

## Known Gaps

- No `production-agent-system` template has been added yet. That is intentionally deferred to Phase 1.
- YAML validation is dependency-free and tailored to the repository's current YAML shape because Phase 0 does not add dependencies.

## Assumptions

- The allowed template variables are `PROJECT_ID`, `PROJECT_NAME`, `PROJECT_TYPE`, `PROJECT_STATUS`, `OWNER_NAME`, and `YYYY-MM-DD`.
- Existing `TBD` entries in harness command matrices are intentional project-time placeholders, not unresolved template variables.

## Risks

- If future templates use more complex YAML features, the validator may need to be upgraded or paired with an approved YAML parser dependency.

## Next Recommended Step

Start Phase 1 by adding `templates/production-agent-system/`, registering it in `templates-index.yaml`, and documenting selection and post-generation usage.

## Evidence

- `harness/evidence-log.md`
