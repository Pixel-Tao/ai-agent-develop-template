# Agent Project Templates

AI Agent가 개발 프로젝트의 목표, 구조, 역할, 작업 상태, 협업 규칙을 빠르게 이해하도록 돕는 템플릿 저장소다. 실제 제품 코드가 아니라 여러 프로젝트에 복사해서 쓰는 시작 구조를 제공한다.

## 빠른 사용법

1. decision-guide.md에서 프로젝트 상황에 맞는 템플릿을 고른다.
2. templates/{template-id}/ 내용을 새 프로젝트 루트로 복사한다.
3. scripts/template-variables.example.yaml을 복사해 값을 채운다.
4. node scripts/replace-template-variables.mjs --root . --variables-file <variables.yaml>로 Dry Run을 확인한다.
5. 문제가 없으면 --apply를 붙여 변수 치환을 적용한다.
6. inputs/initial-development-docs/에 초기 기획서, 메모, 요구사항 초안, 화면 스케치, 참고 링크를 넣는다.
7. Agent는 AGENTS.md, manifest.yaml, inputs/source-documents-index.md를 먼저 읽고 인터뷰를 시작한다.

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

- 새 프로젝트면 greenfield-basic부터 시작한다.
- 기존 코드가 있으면 existing-project-onboarding으로 먼저 분석한다.
- 역할, 승인, 인수인계가 중요하면 large-team-collaboration을 사용한다.
- 보안, 운영, AI/데이터처럼 도메인 통제가 있으면 해당 전문 템플릿을 선택하거나 병합한다.

## 공통 구성

- AGENTS.md: Agent 작업 규칙
- manifest.yaml: Agent가 먼저 읽을 진입점과 폴더 구조
- docs/: 프로젝트 맥락, 요구사항, 결정, 상태 기록
- skills/: 작업 유형별 Agent Skill
- inputs/: 사용자가 미리 가진 초기 개발 문서와 참고 자료
- outputs/: 분석, 리뷰, 보고서 산출물

## 초기 개발 문서

사용자는 대개 아이디어를 완성된 요구사항으로 갖고 있지 않다. 그래서 각 템플릿은 inputs/ 공간을 제공한다. Agent는 이 자료를 확정 요구사항으로 보지 않고, 사실/추정/충돌/질문으로 나눈 뒤 Project Discovery Interview를 통해 목표, 기능, 기술 방향, 콘텐츠, 제약을 구체화한다.
