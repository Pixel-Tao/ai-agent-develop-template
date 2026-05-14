# Healthcheck

The production service exposes `GET /healthz`.

## Manual Check

```bash
npm run build
npm run dev
curl http://localhost:3000/healthz
```

Expected response shape:

```json
{
  "status": "ok",
  "service": "production-agent-system",
  "version": "0.1.0",
  "environment": "development",
  "uptimeSeconds": 1,
  "checks": []
}
```

## Scripted Check

After the API is running and the project is built:

```bash
npm run healthcheck
```

The Docker image also uses `node dist/src/api/healthcheck.js` as its `HEALTHCHECK` command.

## Coverage

- process is alive
- env validation passed at server startup
- queue mode is configured or intentionally disabled
- optional database and trace exporter dependencies are reported as configured, disabled, or not configured
- build/version metadata is returned
