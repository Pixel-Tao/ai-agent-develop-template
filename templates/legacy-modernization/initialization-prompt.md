# Initialization Prompt: Legacy Modernization

당신은 이 프로젝트를 Legacy Modernization 템플릿 기준으로 초기화하는 AI Agent다.

## 입력값

- 프로젝트명:
- 프로젝트 유형:
- 기술 스택:
- 담당자:
- 오늘 날짜:
- 현재 프로젝트 상태:
- 팀 규모:
- 주요 목적:
- 제약사항:

## 작업 목표

레거시 프로젝트 개선, 리팩터링, 마이그레이션을 위한 구조. 프로젝트에 이미 존재하는 파일은 덮어쓰지 말고, 차이가 있으면 병합 필요 항목으로 기록한다.

## 생성 또는 갱신할 구조

- README.md, AGENTS.md, manifest.yaml
- docs/ 하위 필수 문서
- skills/skills-index.yaml 및 필요한 Skill 문서
- outputs/ 산출물 폴더

## 작업 원칙

기존 프로젝트 규칙을 우선하고, 모호한 내용은 assumptions에 기록한다. 위험하거나 승인 필요한 변경은 완료 처리하지 말고 별도 항목으로 표시한다.

## 검증 기준

validation-checklist.md의 기본 파일, 문서 구조, Skill 구조, Agent 작업성, 템플릿별 특수 검증 항목을 모두 확인한다. 검증하지 못한 항목은 이유와 후속 작업을 남긴다.

## 최종 보고 형식

- 초기화 요약
- 생성 또는 갱신한 파일
- 확인한 기존 규칙
- 남은 assumptions와 unknowns
- 검증 결과
- 다음 권장 작업

## 프로젝트 발견 인터뷰 안전장치

초기화 작업을 시작하기 전에 docs/00_discovery/project-discovery-interview.md를 사용해 사용자의 목표, 대상 사용자, 핵심 콘텐츠, 기술 방향, 성공 기준, 제외 범위를 인터뷰한다. 사용자가 모호하게 답한 항목은 확정하지 말고 assumptions 또는 open questions로 분리한다.

인터뷰가 끝나면 project-definition-brief를 작성하고, 그 내용을 기준으로 PRD, architecture, backlog, acceptance criteria를 생성 또는 갱신한다. 최소한 프로젝트 목표, 핵심 사용자, 성공 기준, 필수 범위, 기술 제약이 정리되기 전에는 구현 작업을 완료로 판단하지 않는다.

## 초기 개발 문서 입력 공간

사용자가 이미 가진 기획서, 요구사항 초안, 메모, 화면 스케치, 회의록, 레퍼런스 링크가 있으면 inputs/initial-development-docs/ 또는 inputs/references/에 넣는다. Agent는 인터뷰 전에 inputs/source-documents-index.md를 작성하거나 갱신하고, 초기 문서에서 확인된 사실/추정/충돌/질문을 분리한다.

초기 문서를 참고해 Project Discovery Interview를 진행하되, 문서 내용을 그대로 확정하지 말고 사용자에게 목표, 우선순위, 제외 범위, 성공 기준을 다시 확인한다.

## 하네스 엔지니어링 초기화

프로젝트 초기화 시 harness/ 구조를 확인하고 실제 프로젝트에서 사용할 설치, 실행, 테스트, 빌드, 검증 명령을 harness/commands.md에 정리한다. 작업 유형별 최소 검증은 harness/verification-matrix.md에 기록하고, 초기 실행 결과나 미확정 명령은 harness/evidence-log.md와 docs/09_agent_state/assumptions.md에 남긴다.

## Init 프롬프트 사용

생성된 프로젝트에서는 루트 INIT.md를 초기 설정의 단일 진입점으로 사용한다. 초기 설정 완료 후 INIT.md를 docs/09_agent_state/archive/init/로 이동하고, 이후에는 current-status.md와 run-log.md를 기준으로 작업을 이어간다.
