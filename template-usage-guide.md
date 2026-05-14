# Template Usage Guide

## 1. 준비

Node.js 18 이상을 설치한다. 이 저장소의 생성 스크립트는 별도 npm 패키지 없이 Node.js 기본 기능만 사용한다.

## 2. 템플릿 선택

`decision-guide.md`를 보고 프로젝트 상황에 맞는 템플릿을 고른다. 확신이 없으면 가장 가까운 기본 템플릿을 선택하고, 필요한 전문 폴더만 나중에 병합한다.

## 3. 프로젝트 zip 생성

대화형 실행:

```bash
node scripts/create-project.mjs
```

명령형 실행:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-name my-project --owner-name "project-owner"
```

프로덕션 Agent 시스템 템플릿 생성:

```bash
node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name "project-owner" --force
```

프로젝트명은 자유롭게 입력할 수 있지만 파일명/경로에 사용할 수 없는 문자는 허용하지 않는다. 날짜는 입력하지 않는다. 스크립트가 실행일 기준으로 자동 치환한다.

## 4. 압축 해제 후 초기 문서 추가

생성된 `my-project.zip`을 대상 프로젝트 폴더 안에 풀고, 사용자가 이미 가진 기획서, 메모, 요구사항 초안, 화면 스케치, 회의록, 참고 링크를 `inputs/initial-development-docs/` 또는 `inputs/references/`에 넣는다. zip 안에는 추가 프로젝트명 폴더가 없으므로, 압축 해제 위치가 곧 프로젝트 루트가 된다.

## 5. Agent 지침 확인

Agent는 작업 전에 다음 파일을 읽는다.

- `AGENTS.md`
- `manifest.yaml`
- `inputs/source-documents-index.md`
- `docs/09_agent_state/current-status.md`

역할 기반 템플릿은 루트 `AGENTS.md`를 Router로 보고, 실제 작업 역할에 맞는 `agents/*.md`를 추가로 읽는다.

## 6. 인터뷰로 구체화

바로 구현하지 말고 Project Discovery Interview를 먼저 실행한다. 목표, 사용자, 기능 범위, 기술 스택, 콘텐츠, 성공 기준, 제외 범위, 위험 요소를 확인해 `project-definition-brief.md` 또는 해당 템플릿의 요구사항 문서에 반영한다. 인터뷰는 선택한 템플릿의 성격에 맞게 진행하며, 예를 들어 기존 프로젝트는 변경 금지 영역과 테스트 신뢰도를 먼저 묻고, 보안/규제 프로젝트는 데이터 분류와 승인 흐름을 먼저 묻는다.

## 7. 검증

`validation-checklist.md`로 필수 파일, Agent 진입점, Skill 구조, 작업 로그 위치, assumptions 기록 위치를 확인한다. 누락된 항목이 있으면 구현 전에 먼저 보완한다.

`production-agent-system`은 생성 직후 runtime, tools, memory, evals, observability, security, deploy, harness 구조를 먼저 확인한다. Phase 2부터는 다음 명령으로 mock provider 기반 runtime skeleton을 검증할 수 있다.

```bash
npm install
npm run validate:structure
npm run build
npm run test
npm run validate:tools
npm run eval:smoke
npm run eval
npm run docker:build
npm run test:generator
```

Phase 5부터 `npm run eval:smoke`와 `npm run eval`은 mock provider 기반으로 API key 없이 실행된다. Production memory persistence는 실제 backing store를 선택하는 시점에 adapter를 교체한다.

Phase 6부터 `npm run test`에는 trace/log/metric/audit/redaction 테스트도 포함된다. Observability sink는 기본 in-memory adapter이며, 운영 환경에서는 같은 인터페이스를 보존하는 외부 sink로 교체한다.

Phase 7부터 `npm run test`에는 data classification, secret redaction, prompt injection, approval gate, security policy 테스트도 포함된다. High/destructive action은 approval 없이는 통과하지 않아야 한다.

Phase 8부터 API server, `/healthz`, `/agent/run`, worker queue, env validation, Dockerfile, docker compose가 포함된다. `npm run healthcheck`는 API 서버가 실행 중이고 `npm run build`가 끝난 상태에서 사용한다.

Phase 9부터 루트의 `npm run test:generator`는 `production-agent-system`을 생성해 golden file-list snapshot과 비교하고, unresolved placeholder를 검사하며, 생성 프로젝트 내부에서 `validate-tools`, `npm install`, `build`, `test`, `eval:smoke`를 실행한다.

## 기존 변수 치환 스크립트

이미 복사된 프로젝트에서 변수만 다시 치환해야 할 때는 `scripts/replace-template-variables.mjs`를 사용할 수 있다. 일반적인 새 프로젝트 생성에는 `scripts/create-project.mjs`를 권장한다.

## 8. 하네스 엔지니어링 사용

프로젝트 zip을 풀고 난 뒤 harness/README.md와 harness/harness.yaml을 확인한다. 실제 프로젝트 명령을 harness/commands.md에 정리하고, 작업 유형별 최소 검증을 harness/verification-matrix.md에 맞춘다. 작업 중 실행한 명령과 결과는 harness/evidence-log.md에 기록한다.

## 9. Init 실행

생성된 프로젝트 폴더에서 Agent에게 `init` 또는 `/init`을 요청한다. 루트에 INIT.md가 있으면 Agent가 해당 문서를 실행한다. 초기 설정이 완료되면 INIT.md는 docs/09_agent_state/archive/init/로 이동되며, 이후에는 current-status.md를 기준으로 작업을 이어간다.
