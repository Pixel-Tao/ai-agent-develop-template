# Handoff Note: Phase 5

## Summary

Added a runnable eval harness to `production-agent-system`. The template now has smoke, tool-use, refusal, and regression datasets; scorer modules; dataset loader; eval runner; report writer; `npm run eval:smoke`; `npm run eval`; and tests covering dataset loading, scoring, eval execution, and report writing.

## Changed Files

- `templates/production-agent-system/package.json`
- `templates/production-agent-system/.gitignore`
- `templates/production-agent-system/evals/datasets/`
- `templates/production-agent-system/evals/scorers/`
- `templates/production-agent-system/evals/cases/failure-cases.md`
- `templates/production-agent-system/src/evals/`
- `templates/production-agent-system/tests/evals.test.ts`
- `templates/production-agent-system/harness/commands.md`
- `templates/production-agent-system/harness/verification-matrix.md`
- `templates/production-agent-system/README.md`
- `templates/production-agent-system/template.yaml`
- `templates/production-agent-system/validation-checklist.md`
- `template-usage-guide.md`
- `harness/evidence-log.md`

## Verified Commands

- `npm.cmd install`
  - Result: pass
- `npm.cmd run build`
  - Result: pass
- `npm.cmd run validate:tools`
  - Result: pass
- `npm.cmd run test`
  - Result: pass
  - Evidence: 16 tests, 0 failures.
- `npm.cmd run eval:smoke`
  - Result: pass
  - Evidence: smoke score 1.000.
- `npm.cmd run eval`
  - Result: pass
  - Evidence: refusal, regression, smoke, tool-use all passed with score 1.000.
- `node dist/src/evals/eval-runner.js --dataset failing-threshold`
  - Result: expected failure
  - Evidence: exit code 1 when score 1.000 was below threshold 1.1.
- `node scripts/validate-template.mjs`
  - Result: pass
  - Evidence: Templates checked: 10; YAML files checked: 129.
- `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force`
  - Result: pass

## Known Gaps

- Dataset parsing supports the repository's simple YAML subset, not arbitrary YAML.
- Scorers are deterministic starter scorers for mock-provider evaluation. Production rubrics should be strengthened per use case.
- Eval reports are generated artifacts and are ignored by the template `.gitignore`.

## Assumptions

- Eval commands must run without provider API keys.
- CI should later run `npm run eval:smoke`, while full `npm run eval` can be a separate local or scheduled command until CI scope is expanded.

## Risks

- Current mock-provider evals check harness behavior and regression wiring, not real model quality.
- Tool-use scoring checks forbidden/disallowed tool calls but the mock runner does not yet request tools.

## Next Recommended Step

Start Phase 6 by adding tracing/logging/metrics/audit structure, redaction tests, trace event tests, and tool-call trace integration.

## Evidence

- `harness/evidence-log.md`
