FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV LOG_LEVEL=info
ENV MODEL_PROVIDER=mock
ENV MODEL_NAME=mock-agent
ENV SERVICE_VERSION=0.1.0
ENV QUEUE_MODE=memory
ENV AGENT_WORKER_POLL_MS=1000
ENV SHUTDOWN_GRACE_MS=10000

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY evals ./evals
COPY tools ./tools
COPY memory ./memory
COPY observability ./observability
COPY security ./security

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node dist/src/api/healthcheck.js

CMD ["npm", "run", "serve"]
