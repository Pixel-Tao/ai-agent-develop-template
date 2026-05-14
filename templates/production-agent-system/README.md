# Production Agent System

한국어가 기본 문서입니다. 영어판은 [README.en.md](README.en.md)를 참고하세요.

## 목적

실제 AI Agent 서비스를 생성하기 위한 실행형 시스템 템플릿이다. API 서버, worker, tool calling, memory, eval, observability, security, deployment 구조를 한 프로젝트 안에서 분리해 운영 가능한 Agent 시스템으로 확장할 수 있게 한다.

## 언제 사용해야 하는가

- 실제 AI Agent API 서버를 만들 때
- tool calling이 있는 Agent를 만들 때
- RAG, workflow, background worker가 필요한 Agent를 만들 때
- 평가, tracing, audit, 배포 구조가 필요한 Agent를 만들 때
- 운영 배포 대상 Agent를 만들 때

## 언제 사용하지 말아야 하는가

- 단순 문서 정리 프로젝트
- 빠른 MVP 문서 템플릿
- Agent runtime이 필요 없는 일반 앱

## 초기화 순서

1. `manifest.yaml`의 프로젝트 메타데이터를 확인한다.
2. `AGENTS.md`에서 runtime, tool, memory, security 작업 규칙을 확인한다.
3. `harness/commands.md`에서 현재 확정된 명령과 generated project 초기화 중 채울 항목을 분리한다.
4. `docs/09_agent_state/current-status.md`에 현재 단계와 다음 작업을 기록한다.
5. Phase 2부터 runtime, tests, evals, deployment 명령을 실제 실행 가능한 형태로 채운다.

## 주요 구조

- `src/`: Agent runtime, API, worker, tool, guardrail, memory, observability, security 코드
- `tools/`: tool registry와 permission model 문서
- `memory/`: memory namespace, retention, checkpoint 정책
- `evals/`: dataset, scorer, reports 구조
- `observability/`: tracing, logging, metrics, redaction 정책
- `security/`: data classification, approval, prompt injection, secret 정책
- `deploy/`: Docker, docker compose, env, healthcheck 문서
- `harness/`: 실행 명령, 검증 매트릭스, evidence log

## Runtime 명령

Phase 2부터 mock provider 기반 runtime skeleton은 API key 없이 빌드와 테스트가 가능해야 한다.

```bash
npm install
npm run validate:structure
npm run build
npm run test
npm run validate:tools
```

`npm run test`는 TypeScript build 후 Node 내장 test runner로 runtime smoke test를 실행한다.

## Tool Calling

Phase 3부터 built-in tool registry, schema validation, risk level, approval gate, audit event, timeout/retry policy, and redaction hook이 코드로 제공된다. `high`와 `destructive` tool은 approval 없이 실행되지 않는다.

## Memory and Checkpoint

Phase 4부터 run, thread, user, project, scratchpad, audit namespace를 분리하는 in-memory store와 production adapter interface를 제공한다. Thread state는 `thread_id` 기준으로 분리되고, sensitive long-term user memory는 기본적으로 거부된다. Checkpoint store는 run resume 테스트에 사용할 수 있다.

## Eval Harness

Phase 5부터 mock provider 기반 eval harness를 제공한다. Dataset은 `evals/datasets/`에 있고, 결과는 `evals/reports/`에 기록된다.

```bash
npm run eval:smoke
npm run eval
```

Eval threshold 미달 시 명령은 non-zero exit code를 반환한다.

## Observability

Phase 6부터 trace, structured log, metric, audit event, redaction 구조를 제공한다. Agent run은 `run_id`와 `trace_id`를 가지며 guardrail, LLM call, tool call, memory write, eval score를 관찰할 수 있다. Secret-like 값은 기본적으로 trace/log/audit payload에서 redaction된다.

## Security and Compliance

Phase 7부터 security policy engine, approval gate, data classifier, secret redactor, prompt injection check를 제공한다. High/destructive action은 human approval 없이는 통과하지 않으며, prompt injection 의심 입력은 structured security error로 차단된다.

## Deployment

Phase 8은 실행 가능한 배포 skeleton을 제공한다. API server, `/healthz`, `/agent/run`, background worker queue, env validation, Dockerfile, docker compose, healthcheck script, graceful shutdown hook이 포함된다.

```bash
npm run dev
npm run worker:dev
npm run healthcheck
npm run docker:build
docker compose -f deploy/docker-compose.yml up --build
```

`deploy/env.example`에는 secret 값 없이 non-secret 기본값과 optional service key만 둔다. Production mode에서는 필수 runtime env가 빠졌을 때 명확한 오류로 실패한다.

## 현재 Phase 범위

이 템플릿은 Phase 9에서 mock provider 기반 Agent runner, tool calling safety skeleton, memory namespace, write policy, checkpoint skeleton, eval harness, observability skeleton, security policy skeleton, deployment skeleton을 제공한다. 상위 템플릿 저장소는 generator golden snapshot으로 이 생성 결과를 회귀 검증한다.

## 품질 게이트

- Agent가 처음 읽을 파일이 명확하다.
- runtime, tools, memory, evals, observability, security, deploy 구조가 생성된다.
- 위험 tool과 destructive action은 approval gate 없이는 완료로 보지 않는다.
- trace/log/eval에는 민감정보 원문을 남기지 않는 정책이 있다.
- 검증 결과는 `harness/evidence-log.md`에 남긴다.

## Init 시작

프로젝트를 처음 시작할 때 Agent에게 `init` 또는 `/init`을 요청한다. Agent는 `INIT.md`를 읽고 inputs 문서 확인, Agent system discovery interview, harness 초기화를 수행한다.
