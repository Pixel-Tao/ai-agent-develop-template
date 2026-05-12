# {{PROJECT_NAME}}

## 목적

이 문서는 프로젝트를 처음 읽는 사람과 AI Agent가 프로젝트의 목적, 범위, 현재 상태를 빠르게 이해하도록 돕는다. 실제 프로젝트에 복사한 뒤 placeholder를 실제 값으로 치환하고, 변경될 때마다 최신 상태로 유지한다.

## 빠른 시작

1. manifest.yaml에서 프로젝트 메타데이터를 확인한다.
2. AGENTS.md에서 Agent 작업 규칙을 확인한다.
3. docs/09_agent_state/current-status.md에서 현재 작업 상태를 확인한다.

## 문서 구조

- docs/: 프로젝트 설명, 요구사항, 설계, 작업 상태
- skills/: AI Agent가 사용할 작업 절차
- outputs/: 분석 보고서, 리뷰 결과, 산출물

## 운영 규칙

중요한 결정은 decision log에 기록한다. 모호한 내용은 assumptions에 남기고, 확인된 뒤 관련 문서를 갱신한다.

## 프로젝트 정의

프로젝트를 처음 시작할 때는 docs/00_context/project-discovery-interview.md를 사용해 목표, 사용자, 콘텐츠, 기술 방향, 성공 기준을 먼저 구체화한다. 인터뷰 결과는 project-definition-brief로 요약하고 이후 요구사항, 설계, 작업 목록의 기준으로 사용한다.
