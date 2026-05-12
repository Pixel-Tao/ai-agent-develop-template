# Agent Project Templates

AI Agent가 개발 프로젝트의 목표, 구조, 역할, 작업 상태, 협업 규칙을 빠르게 이해하도록 돕는 템플릿 저장소다. 실제 제품 코드가 아니라 여러 프로젝트에 복사해서 쓰는 시작 구조를 제공한다.

## Requirements

- Node.js 18 이상이 필요하다.
- 새 프로젝트 zip 생성은 루트의 `scripts/create-project.mjs` 하나로 처리한다.
- 프로젝트명은 `my-project`처럼 lower-kebab-case만 허용한다.

## 빠른 사용법

대화형 실행:

```bash
node scripts/create-project.mjs
```

값을 직접 전달해서 실행:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-name my-project --owner-name "project-owner"
```

실행 결과로 저장소 루트에 `my-project.zip`이 생성된다. 날짜는 입력하지 않으며 실행일 기준 `YYYY-MM-DD` 값으로 자동 치환된다.

## 템플릿 목록

| 템플릿 ID | 사용 상황 | 주요 특징 | 추천 대상 |
|---|---|---|---|
| greenfield-basic | 신규 소규모 프로젝트 | 단일 Agent 지침, 기본 요구사항/설계/작업 문서 | 개발자, Tech Lead |
| existing-project-onboarding | 기존 코드베이스 투입 | 코드 분석, 위험 영역, 기존 규칙 보존 | 개발자, Tech Lead |
| large-team-collaboration | 역할이 나뉜 대규모 협업 | Router AGENTS, 역할별 Agent, RACI, workflow | PM, Tech Lead, QA, DevOps |
| legacy-modernization | 레거시 개선/마이그레이션 | 동작 보존, characterization test, rollback | Tech Lead, 유지보수 팀 |
| mvp-prototype | 빠른 검증과 MVP | 최소 문서, 실험, 피드백 기록 | PM, 창업자, 개발자 |
| monorepo-multiservice | 모노레포/멀티서비스 | 서비스/패키지 소유권, 의존성 관리 | Platform, DevOps |
| security-regulated | 보안/규제 요구 프로젝트 | 보안 검토, 감사 증적, 승인 기록 | Security, Compliance, Backend |
| maintenance-operations | 운영 서비스 유지보수 | runbook, incident log, release/rollback | SRE, DevOps, QA |
| ai-data-project | AI/데이터/LLM 프로젝트 | 데이터, 프롬프트, 평가, 실험 추적 | ML Engineer, Data Scientist |

## 선택 기준

- 새 프로젝트면 `greenfield-basic`부터 시작한다.
- 기존 코드가 있으면 `existing-project-onboarding`으로 먼저 분석한다.
- 역할, 승인, 인수인계가 중요하면 `large-team-collaboration`을 사용한다.
- 보안, 운영, AI/데이터처럼 도메인 통제가 있으면 해당 전문 템플릿을 선택하거나 병합한다.

## 생성기가 하는 일

1. 템플릿을 선택한다.
2. 임시 폴더에 템플릿을 복사한다.
3. `{{PROJECT_ID}}`, `{{PROJECT_NAME}}`, `{{OWNER_NAME}}`, `{{YYYY-MM-DD}}` 등을 치환한다.
4. 루트에 `project-name.zip`을 만든다.
5. 임시 폴더를 정리한다.

## 초기 개발 문서

각 템플릿에는 `inputs/` 공간이 있다. 사용자는 기획서, 메모, 요구사항 초안, 화면 스케치, 참고 링크를 `inputs/initial-development-docs/` 또는 `inputs/references/`에 넣을 수 있다. Agent는 이 자료를 확정 요구사항으로 보지 않고, 사실/추정/충돌/질문으로 나눈 뒤 Project Discovery Interview를 통해 목표, 기능, 기술 방향, 콘텐츠, 제약을 구체화한다.

## 하네스 엔지니어링

각 템플릿에는 harness/ 폴더와 harness-engineering Skill이 포함된다. Agent는 구현 전에 실행 명령, 검증 기준, 증거 로그, 산출물 위치를 확인하고 작업 결과를 harness/evidence-log.md에 남긴다. 이 구조는 테스트, 리뷰, 릴리즈, 운영 대응을 반복 가능하게 만들기 위한 안전장치다.

## Init 시작 방식

생성된 프로젝트에서는 별도 스크립트 없이 Agent에게 `init`, `/init`, `초기화` 중 하나를 요청한다. Agent는 루트의 INIT.md를 읽고 inputs/ 확인, 문서 기반 또는 대화형 인터뷰, harness 초기화를 진행한다. 인터뷰 질문은 템플릿 성격에 맞게 다르며, 신규 개발, 기존 프로젝트 온보딩, 대규모 협업, 레거시 개선, MVP, 모노레포, 보안/규제, 운영, AI/데이터 상황별로 우선 확인할 내용이 분리되어 있다. 초기 설정이 완료되면 INIT.md는 docs/09_agent_state/archive/init/로 이동되어 다시 자동 실행되지 않는다.
