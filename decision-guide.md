# Template Decision Guide

## 빠른 선택

| 상황 | 선택할 템플릿 |
|---|---|
| 새로 시작하는 작은 프로젝트 | greenfield-basic |
| 이미 코드가 있는 프로젝트 | existing-project-onboarding |
| 5명 이상, 역할 분리, 승인 절차 필요 | large-team-collaboration |
| 레거시 개선 또는 마이그레이션 | legacy-modernization |
| 빠른 MVP/프로토타입 | mvp-prototype |
| 모노레포 또는 여러 서비스 | monorepo-multiservice |
| 보안, 개인정보, 감사, 규제 요구 | security-regulated |
| 운영 중인 서비스 유지보수 | maintenance-operations |
| AI, 데이터, LLM, 평가 실험 | ai-data-project |
| 실제 Agent API 서버, worker queue, tool calling, memory, eval, tracing, Docker 배포 필요 | production-agent-system |

## 선택 질문

1. 프로젝트는 신규인가, 기존 프로젝트인가?
2. 현재 참여 인원과 역할은 어떻게 나뉘는가?
3. 코드베이스가 이미 크거나 위험 영역이 있는가?
4. 보안, 개인정보, 감사, 승인 절차가 필요한가?
5. 운영 중인 서비스라 장애 대응과 릴리즈 추적이 필요한가?
6. 레거시 동작 보존이나 단계적 마이그레이션이 핵심인가?
7. 모노레포, 멀티서비스, 공통 패키지 의존성이 있는가?
8. 데이터셋, 프롬프트, 모델 평가, 실험 관리가 중요한가?
9. Agent runtime, tool approval, memory, eval, tracing, 배포가 한 프로젝트 안에 필요한가?

## 혼합 사용

템플릿은 하나만 써야 하는 구조가 아니다. 예를 들어 기존 금융 서비스라면 existing-project-onboarding으로 먼저 분석하고, security-regulated의 보안/감사 문서를 병합한다. 운영 중인 모노레포라면 monorepo-multiservice에 maintenance-operations의 runbook과 incident log를 추가한다.

`production-agent-system`은 단순 문서 템플릿이 아니라 Agent 서비스를 실행형 시스템으로 발전시키기 위한 선택지다. 기존 서비스에 Agent를 붙이는 경우에는 먼저 `existing-project-onboarding`으로 현재 시스템을 분석한 뒤 필요한 runtime, tool, eval, security, deployment 구조를 병합한다.

## 추천 흐름

1. 상황에 가장 가까운 기본 템플릿을 고른다.
2. 도메인 통제가 있으면 전문 템플릿의 일부 폴더를 추가한다.
3. inputs/에 초기 문서를 넣고 인터뷰로 요구사항을 구체화한다.
4. validation-checklist.md로 필수 구조를 확인한다.
