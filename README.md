# Agent Project Templates

## 목적

Agent Project Templates는 개발 프로젝트에 AI Agent를 빠르게 투입할 수 있도록 프로젝트 구조, 역할, Skill, 작업 상태, 협업 규칙을 정리한 재사용 가능한 템플릿 팩이다. 실제 애플리케이션 코드가 아니라 여러 프로젝트에 복사해서 초기 문서 구조와 Agent 운영 기준을 세우는 저장소다. 기본 문서 언어는 Korean이며, 문서는 Markdown, 메타데이터는 YAML을 사용한다.

## 템플릿 목록

| 템플릿 ID | 사용 상황 | 주요 특징 | 추천 대상 |
| --- | --- | --- | --- |
| greenfield-basic | 신규 프로젝트 초기 구성 | 단일 AGENTS.md, 요구사항/설계/작업 상태 기본 문서 | 소규모 개발팀, Tech Lead, AI Agent |
| existing-project-onboarding | 문서가 부족한 기존 프로젝트 분석 | Discovery, 위험 목록, 변경 금지 영역, 보존 규칙 | 기존 프로젝트 담당 개발자, Tech Lead |
| large-team-collaboration | 5명 이상 역할 분리 협업 | Agent Router, 역할별 Agent 문서, RACI, Workflow | PM, Tech Lead, QA, DevOps, Security |
| legacy-modernization | 기존 동작 보존이 중요한 레거시 개선 | Characterization test, rollback, 단계적 현대화 계획 | Tech Lead, 유지보수 개발자, QA |
| mvp-prototype | 빠른 실험과 MVP 검증 | 최소 문서, 핵심 가정, 실험 결과 기록 | 창업팀, PM, 프로토타입 개발자 |
| monorepo-multiservice | 여러 앱/서비스/패키지가 한 저장소에 있는 경우 | 서비스 레지스트리, 패키지 맵, 의존성 그래프, 역할 Agent | 플랫폼 팀, 서비스 팀, DevOps |
| security-regulated | 민감정보, 인증, 감사 근거가 필요한 프로젝트 | 보안 문서, 컴플라이언스 매트릭스, 증적 로그, 승인 정책 | Security, Compliance, Backend, QA |
| maintenance-operations | 운영 안정성과 추적성이 중요한 서비스 | Runbook, incident log, release checklist, rollback plan | 운영 개발자, SRE, DevOps, QA |
| ai-data-project | 데이터셋, 프롬프트, 평가, 실험 추적이 중요한 프로젝트 | Data catalog, model card, prompt registry, evaluation plan, experiment log | ML Engineer, Data Scientist, AI Agent 개발자 |

## 사용 방식

1. decision-guide.md로 프로젝트 상황에 맞는 템플릿을 고른다.
2. 선택한 templates/{template-id}/ 폴더를 대상 프로젝트에 복사한다.
3. {{PROJECT_NAME}}, {{OWNER_NAME}}, {{YYYY-MM-DD}} 같은 변수를 실제 값으로 치환한다.
4. AGENTS.md와 manifest.yaml을 먼저 읽고 프로젝트의 현재 상태를 문서화한다.

## 템플릿 선택 기준

신규 프로젝트는 greenfield-basic, 기존 코드베이스는 existing-project-onboarding, 역할 분리가 필요한 팀은 large-team-collaboration을 우선 검토한다. 보안, 운영, AI/데이터처럼 도메인 통제가 중요한 프로젝트는 해당 전문 템플릿을 선택하거나 기본 템플릿과 혼합한다.

## 공통 구성

common/에는 기본 파일, 기본 문서, 공통 Skill, 체크리스트, 반복 사용 가능한 스니펫이 들어 있다. 템플릿별 구조가 달라도 Agent가 읽어야 할 진입점, 작업 로그, assumptions, known issues 기록 방식은 같은 방향을 유지한다.

## 상황별 차이

작은 프로젝트는 단일 AGENTS.md 중심으로 운영한다. 대규모 협업, 모노레포, 보안/규제, AI/데이터 프로젝트는 역할별 Agent 문서와 도메인별 통제 문서를 분리해 책임과 승인 기준을 명확히 한다.

## 권장 사용 순서

1. 템플릿 선택
2. 프로젝트 복사
3. 변수 치환
4. manifest.yaml 갱신
5. AGENTS.md 또는 역할별 Agent 문서 확인
6. 초기 작업과 위험 요소 등록
7. 검증 체크리스트 완료

## 프로젝트 발견 인터뷰

모든 템플릿은 구현 전에 사용자의 막연한 아이디어를 구체화하기 위한 Project Discovery Interview를 포함한다. 이 인터뷰는 프로젝트 목표, 대상 사용자, 콘텐츠, 기술 방향, 성공 기준, 제외 범위, 보안/운영 제약을 질문해 project-definition-brief를 만들도록 유도한다.

## 변수 치환 스크립트

`scripts/replace-template-variables.ps1`은 `{{PROJECT_NAME}}`, `{{OWNER_NAME}}`, `{{YYYY-MM-DD}}` 같은 placeholder를 일괄 치환한다. 먼저 `scripts/template-variables.example.yaml`을 복사해 값을 채운 뒤 변경 대상을 확인하고, 문제가 없으면 `-Apply`를 붙여 실제 파일에 적용한다. `-Apply`가 없으면 기본적으로 Dry Run으로 동작한다.
