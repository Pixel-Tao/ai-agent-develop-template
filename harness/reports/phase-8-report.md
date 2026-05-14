# Handoff Note: Phase 8

## Summary

Added deployment hardening for `production-agent-system`. The template now includes a real API server startup path, `/healthz`, `/agent/run`, healthcheck script, worker queue skeleton, production env validation, graceful shutdown hooks, Dockerfile, docker compose API/worker services, CI build/test/eval/Docker steps, and deployment-focused tests.

## Changed Files

- `templates/production-agent-system/src/config/env.ts`
- `templates/production-agent-system/src/api/server.ts`
- `templates/production-agent-system/src/api/routes.ts`
- `templates/production-agent-system/src/api/health.ts`
- `templates/production-agent-system/src/api/healthcheck.ts`
- `templates/production-agent-system/src/workers/agent-worker.ts`
- `templates/production-agent-system/src/workers/queue.ts`
- `templates/production-agent-system/tests/api.test.ts`
- `templates/production-agent-system/tests/deployment.test.ts`
- `templates/production-agent-system/deploy/*`
- `templates/production-agent-system/.dockerignore`
- `.github/workflows/validate.yml`
- `templates/production-agent-system/harness/*`
- `templates/production-agent-system/README.md`
- `templates/production-agent-system/template.yaml`
- `templates/production-agent-system/validation-checklist.md`
- `README.md`
- `decision-guide.md`
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
  - Evidence: 33 tests, 0 failures.
- `npm.cmd run eval:smoke`
  - Result: pass
  - Evidence: smoke score 1.000.
- `npm.cmd run eval`
  - Result: pass
  - Evidence: refusal, regression, smoke, tool-use all passed with score 1.000.
- `npm.cmd run healthcheck`
  - Result: pass
  - Evidence: local API on `127.0.0.1:3109` returned healthy response.
- `npm.cmd run docker:build`
  - Result: pass after approved Docker daemon escalation.
  - Evidence: image `production-agent-system:local` built successfully.
- `docker compose -f deploy/docker-compose.yml config`
  - Result: pass
- `node scripts/validate-template.mjs`
  - Result: pass
  - Evidence: Templates checked: 10; YAML files checked: 129.
- `node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name tao --force`
  - Result: pass
- `tar -tf sample-agent.zip | Select-String -Pattern 'src/api/health|src/api/healthcheck|src/workers/queue|tests/api.test.ts|tests/deployment.test.ts|.dockerignore|deploy/Dockerfile|deploy/docker-compose.yml|node_modules|dist|evals/reports/.+-latest|.docker-tmp'`
  - Result: pass
  - Evidence: deployment files included; generated artifacts excluded.

## Known Gaps

- Queue persistence is an in-memory starter adapter; production systems should replace it with a durable queue adapter.
- Database and trace exporter health are reported as configured/disabled, not actively probed.
- Docker compose starts API and worker services, but no external queue or database service is included yet.

## Assumptions

- `MODEL_PROVIDER=mock` remains the default provider for generated-project verification without API keys.
- `deploy/env.example` should contain only non-secret defaults and blank optional service keys.
- Production deployers will provide real secret values through their platform secret manager, not committed files.

## Risks

- A memory queue is not suitable for production reliability.
- Healthcheck dependency status is structural until real backing services are selected.
- Docker build requires Docker daemon access and may need local approval in locked-down environments.

## Next Recommended Step

Start Phase 9 by adding golden snapshot tests for generated `production-agent-system` output and generator-level regression checks.

## Evidence

- `harness/evidence-log.md`
