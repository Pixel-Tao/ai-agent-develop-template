# Agent Router Instructions

## 목적

대규모 협업 템플릿의 루트 AGENTS.md는 모든 상세 지침을 담지 않고 Agent Router 역할을 한다. 실제 작업 지침은 agents/ 아래 역할별 Agent 문서와 skills/ 아래 Skill 문서에서 확인한다.

## 작업 시작 절차

1. manifest.yaml 확인
2. agents/agents-index.yaml 확인
3. 작업 성격에 맞는 역할 Agent 선택
4. skills/skills-index.yaml 확인
5. 관련 Skill 로드
6. docs/04_tasks/work-allocation.md 확인
7. 작업 수행
8. docs/09_agent_state/run-log.md와 handoff-notes.md 업데이트

## 역할 선택 규칙

요구사항은 product-manager-agent, 아키텍처와 승인 판단은 tech-lead-agent, 구현은 frontend/backend/database/devops 역할을 선택한다. 보안 영향이 있으면 security-agent, 품질 검증은 qa-agent, 문서화는 documentation-agent를 포함한다.

## 역할별 Agent 문서 위치

agents/ 폴더에 역할별 Agent 문서가 있다. agents/agents-index.yaml에서 책임과 협업 대상을 먼저 확인한다.

## Skill 선택 규칙

skills/skills-index.yaml에서 작업 성격에 맞는 Skill을 선택한다. 역할과 Skill이 충돌하면 역할 책임과 governance 정책을 우선한다.

## 협업 워크플로우

작업 접수, 역할 배정, 구현, 리뷰, QA, 릴리즈, 인수인계 순서로 진행한다. 의존성은 dependency-board.md에 기록한다.

## 승인 필요 작업

요구사항 변경, API 스펙 변경, DB 스키마 변경, 인증/인가 변경, 릴리즈 승인, 장애 대응, 보안 이슈 대응, 테스트 전략 변경은 지정된 승인 흐름을 따른다.

## 금지사항

다른 역할 소유 영역을 단독으로 확정하지 않는다. 승인 없이 삭제, 공개 API 변경, DB 변경, 보안 정책 변경을 완료 처리하지 않는다.

## 작업 완료 보고 형식

- 선택한 역할 Agent
- 수행한 작업
- 변경 또는 생성한 파일
- 협업/승인 필요 항목
- 검증 결과
- 다음 인수인계 내용

## 프로젝트 발견 인터뷰 규칙

사용자의 요청이 대략적이거나 목표, 사용자, 성공 기준, 기술 범위가 불명확하면 먼저 project-discovery-interview.md와 project-discovery-interview Skill을 사용한다. Agent는 모호한 답변을 임의로 확정하지 않고, 결정/가정/미정을 분리해 기록한 뒤 project-definition-brief를 기준으로 다음 문서를 작성한다.
