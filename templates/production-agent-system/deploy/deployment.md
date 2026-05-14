# Deployment

This folder contains the deployment skeleton for the generated Agent service.

## Local Runtime

```bash
npm install
npm run build
npm run test
npm run dev
```

The API server listens on `HOST` and `PORT` from `deploy/env.example` and exposes:

- `GET /healthz`
- `POST /agent/run`

Run the background worker in a separate terminal:

```bash
npm run worker:dev
```

## Container Runtime

```bash
npm run docker:build
docker compose -f deploy/docker-compose.yml up --build
```

The Docker image builds TypeScript in a build stage and runs the compiled API with `npm run serve`.
The worker service uses the same image and runs `npm run worker`.

## Environment Policy

- `deploy/env.example` contains non-secret defaults and blank keys for optional backing services.
- Production mode requires `NODE_ENV`, `PORT`, `LOG_LEVEL`, `MODEL_PROVIDER`, `MODEL_NAME`, and `SERVICE_VERSION`.
- `QUEUE_MODE=external` requires `QUEUE_URL`; the starter adapter is `QUEUE_MODE=memory`.
- `DATABASE_URL`, `QUEUE_URL`, and `TRACE_EXPORTER` must not contain real production secret values in this file.

## Shutdown

The API server listens for `SIGTERM` and `SIGINT`, closes the HTTP server, and forces exit after `SHUTDOWN_GRACE_MS`.
The worker listens for the same signals and stops its polling loop through an abort signal.
