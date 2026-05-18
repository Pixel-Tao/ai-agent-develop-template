# Agent Project Templates

한국어가 기본 문서입니다. 영어판은 [README.en.md](README.en.md)를 참고하세요.
문서 언어 정책은 [docs/localization.md](docs/localization.md)에 정리되어 있습니다.

AI Agent가 개발 프로젝트의 목표, 구조, 역할, 작업 상태, 협업 규칙을 빠르게 이해하도록 돕는 프로젝트 템플릿 저장소입니다. 실제 제품 코드 저장소가 아니라, 새 프로젝트나 기존 프로젝트에 복사해 쓸 수 있는 Agent 친화 개발 구조를 제공합니다.

현재 저장소는 10개 템플릿, 프로젝트 zip 생성기, Delivery Sanitization, 템플릿 검증기, 생성 결과 회귀 테스트, 한국어 기본 문서와 영어 sidecar 문서 체계를 포함합니다.

## 제공 범위

- 프로젝트 유형별 AI Agent 작업 구조
- `AGENTS.md`, `CLAUDE.md`, `INIT.md`, `manifest.yaml` 기반 Agent 진입점
- 요구사항, 설계, 작업, 의사결정, 상태 기록을 위한 문서 골격
- `inputs/` 기반 초기 자료 수집 흐름
- `skills/skills-sh-recommendations.yaml` 기반 skills.sh 검색/설치 후보 구성
- `harness/` 기반 실행 명령, 검증 기준, 증거 로그
- 공통 Skill과 템플릿별 Skill 구조
- 프로젝트 zip 생성 스크립트와 변수 치환
- 납품용 clean package와 내부 archive를 분리하는 Delivery Sanitization
- 템플릿 구조, YAML, placeholder, 영어 companion 문서 검증
- `production-agent-system` 생성 결과 golden snapshot 테스트

## 요구사항

- Node.js 18 이상
- 별도 npm 의존성 없이 기본 생성기와 검증기를 실행할 수 있습니다.
- `production-agent-system`으로 생성한 프로젝트는 TypeScript 개발 의존성을 설치해야 빌드와 테스트를 실행할 수 있습니다.

## 빠른 시작

사용 가능한 템플릿을 확인합니다.

```bash
node scripts/create-project.mjs --list
```

대화형으로 프로젝트 zip을 생성합니다.

```bash
node scripts/create-project.mjs
```

값을 직접 전달해 생성합니다. `--project-id`는 파일명과 manifest id에 사용하고, `--project-name`은 사람이 읽는 표시명에 사용합니다. `--project-id`를 직접 지정하면 `Project.Name`, `ProjectName`, `project_name`, `project-name`처럼 단일 디렉터리/zip 파일명으로 안전한 값을 사용할 수 있습니다.

```bash
node scripts/create-project.mjs --template greenfield-basic --project-id Project.Name --project-name "My Project" --owner-name "project-owner"
```

프로덕션 AI Agent 시스템 템플릿을 생성합니다.

```bash
node scripts/create-project.mjs --template production-agent-system --project-name sample-agent --owner-name "project-owner"
```

결과물은 저장소 루트의 `<project-name>.zip`입니다. zip 내부에는 추가 상위 폴더 없이 프로젝트 파일이 바로 들어갑니다. 날짜 placeholder는 실행일 기준 `YYYY-MM-DD`로 자동 치환됩니다.

기존 zip을 덮어써야 할 때만 `--force`를 추가합니다.

## 템플릿 목록

| 템플릿 ID | 사용 상황 | 주요 특징 | 추천 대상 |
|---|---|---|---|
| `greenfield-basic` | 신규 소규모 프로젝트 | 기본 요구사항, 설계, 작업, 상태 문서 | 개발자, Tech Lead |
| `existing-project-onboarding` | 기존 코드베이스 투입 | 코드베이스 조사, 위험 영역, 기존 규칙 보존 | 개발자, Tech Lead |
| `large-team-collaboration` | 역할이 나뉜 대규모 협업 | Router AGENTS, 역할별 Agent, RACI, workflow | PM, Tech Lead, QA, DevOps |
| `legacy-modernization` | 레거시 개선/마이그레이션 | 동작 보존, characterization test, rollback 계획 | Tech Lead, 유지보수 팀 |
| `mvp-prototype` | 빠른 검증과 MVP | 최소 문서, 실험 계획, 피드백 기록 | PM, 창업자, 개발자 |
| `monorepo-multiservice` | 모노레포/멀티서비스 | 서비스/패키지 소유권, 의존성 관리 | Platform, DevOps |
| `security-regulated` | 보안/규제 요구 프로젝트 | 보안 검토, 감사 증적, 승인 기록 | Security, Compliance, Backend |
| `maintenance-operations` | 운영 서비스 유지보수 | runbook, incident log, release/rollback | SRE, DevOps, QA |
| `ai-data-project` | AI/데이터/LLM 프로젝트 | 데이터, 프롬프트, 평가, 실험 추적 | ML Engineer, Data Scientist |
| `production-agent-system` | 프로덕션 AI Agent 시스템 | runtime, tool calling, memory, eval, tracing, security, API/worker deploy | AI Platform, Backend, DevOps |

자세한 선택 기준은 [decision-guide.md](decision-guide.md)를 참고하세요.

## 추천 사용 흐름

1. [decision-guide.md](decision-guide.md)로 프로젝트 상황에 맞는 템플릿을 고릅니다.
2. `node scripts/create-project.mjs`로 zip을 생성합니다.
3. 생성된 zip을 실제 프로젝트 위치에 풉니다.
4. 기획서, 메모, 요구사항 초안, 화면 스케치, 참고 링크를 `inputs/`에 추가합니다.
5. Agent에게 `init`, `/init`, `초기화` 중 하나를 요청합니다.
6. Agent가 `INIT.md`, `AGENTS.md`, `manifest.yaml`, `skills/skills-sh-recommendations.yaml`, `harness/`를 읽고 초기 인터뷰, skills.sh 기반 Skill 구성, 작업 상태 정리를 진행합니다.
7. 구현, 검증, 리뷰, 릴리즈 증거를 `harness/evidence-log.md`와 `docs/09_agent_state/`에 남깁니다.

## 생성 프로젝트의 기본 구조

| 경로 | 역할 |
|---|---|
| `README.md` | 생성 프로젝트의 목적과 사용법 |
| `README.en.md` | 영어 companion 문서 |
| `AGENTS.md` | Agent 작업 규칙과 우선순위 |
| `CLAUDE.md` | Claude 계열 Agent를 위한 진입 지침 |
| `INIT.md` | 최초 초기화 절차 |
| `manifest.yaml` | 프로젝트와 템플릿 메타데이터 |
| `template.yaml` | 템플릿 정의와 필수 파일 |
| `validation-checklist.md` | 생성 직후 확인할 체크리스트 |
| `inputs/` | 초기 개발 자료와 참고 문서 |
| `docs/` | 요구사항, 설계, 작업, 의사결정, 상태 문서 |
| `skills/` | Agent가 사용할 작업별 Skill |
| `skills/skills-sh-recommendations.yaml` | skills.sh 검색어와 추천 source 목록 |
| `harness/` | 명령, 검증 매트릭스, evidence log |
| `delivery/` | 납품 정책, manifest, checklist, report |
| `.deliveryignore` | 납품 패키지 제외 규칙 |
| `.agentignore` | 납품 후 Agent active context 제외 규칙 |

템플릿별로 `agents/`, `workflows/`, `security/`, `operations/`, `evals/`, `deploy/` 같은 도메인 폴더가 추가될 수 있습니다.

## Delivery Sanitization

개발 완료 후 고객 납품본에는 원본 소스, 테스트, 필수 문서, 라이선스, 배포 산출물만 포함하고 Agent 운영자료는 제외해야 할 수 있습니다. 이 저장소는 원본 작업 저장소를 삭제하지 않고 별도 clean package와 internal archive를 생성하는 흐름을 제공합니다.

```bash
node scripts/archive-agent-workspace.mjs --policy delivery/sanitize-policy.yaml --output dist/internal-archive
node scripts/create-delivery-package.mjs --policy delivery/sanitize-policy.yaml --output dist/delivery
node scripts/validate-delivery-clean.mjs --package dist/delivery/<package>.zip --policy delivery/sanitize-policy.yaml
```

기본 정책은 `AGENTS.md`, `CLAUDE.md`, `INIT.md`, `skills/`, `harness/`, `inputs/`, `docs/09_agent_state/` 같은 Agent 운영자료를 납품 패키지에서 제외합니다. 계약, 감사, 보안, 라이선스상 보존 가능성이 있는 자료는 삭제하지 않고 내부 아카이브 또는 검토 대상으로 분류합니다.

## Production Agent System

`production-agent-system`은 실제 AI Agent 서비스를 만들기 위한 실행형 템플릿입니다. 문서 골격뿐 아니라 TypeScript 기반 skeleton을 포함합니다.

포함 범위:

- Agent runtime과 run lifecycle
- API server, `/healthz`, `/agent/run`
- background worker queue
- tool registry, schema validation, permission, approval gate
- memory namespace, checkpoint, write policy
- eval dataset, scorer, eval runner
- trace, structured log, metric, audit event, redaction
- data classification, secret redaction, prompt injection check, security policy
- Dockerfile, docker compose, env validation, healthcheck
- generator golden snapshot 회귀 테스트 대상

생성한 프로젝트 안에서 주로 사용하는 명령:

```bash
npm install
npm run validate:structure
npm run build
npm run test
npm run validate:tools
npm run eval:smoke
npm run eval
npm run docker:build
```

mock provider 기반으로 API key 없이 기본 빌드, 테스트, smoke eval을 실행할 수 있게 구성되어 있습니다. 실제 운영 적용 시에는 provider, memory store, observability sink, secret 관리, 배포 환경을 프로젝트 요구에 맞게 교체해야 합니다.

## 저장소 검증

루트 저장소에서 템플릿 전체를 검증합니다.

```bash
npm run validate
```

검증 항목:

- `templates-index.yaml`과 실제 `templates/` 디렉터리 일치
- 각 템플릿의 필수 파일 존재
- `manifest.yaml`, `template.yaml`, `templates-index.yaml`의 ID 정합성
- YAML 기본 구조
- 허용되지 않은 `{{PLACEHOLDER}}` 사용 여부
- 필수 영어 companion 문서 존재 여부
- 생성기 목록과 템플릿 인덱스 일치

`production-agent-system` 생성 결과를 snapshot으로 검증합니다.

```bash
npm run test:generator
```

GitHub Actions의 `.github/workflows/validate.yml`도 같은 검증 흐름을 실행합니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `node scripts/create-project.mjs --list` | 생성 가능한 템플릿 목록과 간략 설명 출력 |
| `node scripts/create-project.mjs` | 대화형 프로젝트 zip 생성 |
| `node scripts/create-project.mjs --template <id> --project-name <name> --owner-name <owner>` | 명령형 프로젝트 zip 생성 |
| `node scripts/create-project.mjs --template <id> --project-id <id> --project-name <name> --owner-name <owner>` | id와 표시명을 분리한 프로젝트 zip 생성 |
| `node scripts/validate-template.mjs` | 템플릿 저장소 검증 |
| `node scripts/create-delivery-package.mjs --policy <file> --output <dir>` | 납품용 clean package 생성 |
| `node scripts/archive-agent-workspace.mjs --policy <file> --output <dir>` | Agent 운영자료 내부 archive 생성 |
| `node scripts/validate-delivery-clean.mjs --package <zip> --policy <file>` | 납품 패키지 clean 검증 |
| `node scripts/apply-template.mjs --template <id> --target <dir> --dry-run` | 기존 프로젝트에 템플릿 안전 적용 |
| `npx skills add <owner/repo>` | skills.sh에서 검토한 외부 Skill 설치 |
| `npm run validate` | 검증 스크립트 실행 |
| `npm run test:generator` | 생성 결과 snapshot 테스트 |
| `npm run test:generator:all` | 모든 템플릿 생성 smoke test |
| `npm run test:delivery` | 모든 템플릿 delivery package test |
| `npm run test:skills` | 템플릿별 skills.sh 추천 구성 테스트 |
| `node scripts/replace-template-variables.mjs --root <path> --variables-file <file> --apply` | 이미 복사된 프로젝트의 변수 치환 |

자세한 내용은 [scripts/README.md](scripts/README.md)를 참고하세요.

## 문서 언어 정책

- 한국어 문서가 기본이며 원본 역할을 합니다.
- 영어 문서는 같은 위치의 `.en.md` sidecar 파일로 제공합니다.
- 루트 가이드와 각 템플릿의 진입점 README는 한국어와 영어판을 함께 유지합니다.
- 세부 도메인 문서, Skill 예시, 체크리스트는 한국어를 기본으로 유지하되 필요할 때 같은 위치에 `.en.md`를 추가합니다.

## 관련 문서

- [decision-guide.md](decision-guide.md): 템플릿 선택 기준
- [template-usage-guide.md](template-usage-guide.md): 생성 후 사용 절차
- [template-notes.md](template-notes.md): 템플릿 설계 메모
- [common/README.md](common/README.md): 공통 파일, 문서, Skill 구조
- [scripts/README.md](scripts/README.md): 생성/검증/치환 스크립트
- [common/delivery/README.md](common/delivery/README.md): Delivery Sanitization 공통 정책
- [docs/localization.md](docs/localization.md): 문서 언어 정책
