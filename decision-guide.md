# Template Decision Guide

## 빠른 선택 기준

신규 프로젝트는 greenfield-basic부터 시작한다. 기존 코드가 있으면 existing-project-onboarding으로 먼저 분석하고, 이후 필요한 도메인 템플릿을 병합한다. 역할과 승인 흐름이 복잡하면 large-team-collaboration을 사용한다. 보안, 운영, AI/데이터 요구가 명확하면 각각의 전문 템플릿을 선택한다.

## 질문 기반 선택

1. 프로젝트가 신규인가, 기존 프로젝트인가?
2. 참여 인원이 몇 명인가?
3. 역할 분리가 필요한가?
4. 코드베이스가 이미 큰가?
5. 보안/규제 요구사항이 있는가?
6. 운영 중인 서비스인가?
7. 레거시 개선이 주 목적인가?
8. 모노레포 또는 멀티서비스인가?
9. AI/데이터/LLM 프로젝트인가?

## 상황별 추천

| 상황 | 추천 템플릿 | 이유 |
| --- | --- | --- |
| 신규 소규모 개발 | greenfield-basic | 초기 문서와 단일 Agent 지침으로 충분하다. |
| 기존 프로젝트 투입 | existing-project-onboarding | 코드베이스 분석과 위험 영역 기록이 우선이다. |
| 대규모 협업 | large-team-collaboration | 역할별 책임, 승인, 인수인계가 필요하다. |
| 레거시 개선 | legacy-modernization | 동작 보존과 단계적 마이그레이션이 핵심이다. |
| 빠른 실험 | mvp-prototype | 핵심 가정과 실험 결과만 가볍게 추적한다. |
| 모노레포 | monorepo-multiservice | 서비스와 패키지 의존성을 따로 관리해야 한다. |
| 보안/규제 | security-regulated | 보안 검토, 감사 증적, 승인 기록이 필수다. |
| 운영 유지보수 | maintenance-operations | 장애, 릴리즈, rollback 중심으로 관리한다. |
| AI/데이터 | ai-data-project | 데이터, 프롬프트, 평가, 실험 이력을 추적한다. |

## 혼합 사용 방식

템플릿은 하나만 사용해야 하는 구조가 아니다. 예를 들어 기존 금융 서비스는 existing-project-onboarding으로 분석한 뒤 security-regulated의 보안/컴플라이언스 폴더를 병합할 수 있다. 모노레포에서 운영 중인 서비스는 monorepo-multiservice에 maintenance-operations의 runbook과 incident log를 추가한다.

## 예시

5명 이상이 참여하는 신규 SaaS 백오피스라면 large-team-collaboration을 기본으로 사용하고, 초기 구현 문서는 greenfield-basic의 요구사항/설계 문서를 참고한다. 이미 운영 중인 레거시 서비스라면 existing-project-onboarding으로 현황을 재구성한 뒤 legacy-modernization과 maintenance-operations를 함께 적용한다.
