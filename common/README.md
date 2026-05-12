# Common Resources

공통 리소스는 모든 템플릿에서 반복 사용되는 기본 파일, 기본 문서, Skill, 체크리스트, 스니펫을 모아 둔 영역이다. 템플릿별 구조가 달라도 공통 리소스를 기준으로 문서 형식과 Agent 작업 규칙의 일관성을 유지한다.

## 사용 방법

이 문서는 프로젝트 초기화 시 초안을 작성하고 작업 진행에 따라 갱신한다. AI Agent는 작업 전에 이 문서의 현재 상태를 확인하고, 불확실한 내용은 단정하지 않고 assumptions 또는 unknowns에 기록한다.

## 구성

- base-files/: README, AGENTS, manifest, gitignore 기본형
- base-docs/: 프로젝트 개요, 용어집, assumptions, decision log, run log, todo
- base-skills/: 공통 Skill 세트
- checklists/: 검증과 릴리즈에 사용할 체크리스트
- snippets/: 작업, 결정, 인수인계, 위험, 보고서 템플릿

## 프로젝트 발견 인터뷰

common/base-docs/project-discovery-interview.md는 모든 템플릿에서 사용할 수 있는 공통 인터뷰 양식이다. common/base-skills/project-discovery-interview는 이 인터뷰를 실행하는 Agent Skill이며, common/snippets/project-definition-brief-template.md는 인터뷰 결과를 정리하는 최종 산출물 양식이다.

## 초기 개발 문서 입력 공간

common/base-inputs/는 사용자가 프로젝트 시작 전에 가진 기획서, 요구사항 초안, 메모, 스케치, 회의록, 레퍼런스를 넣기 위한 기본 구조다. Agent는 이 문서를 먼저 색인화하고, Project Discovery Interview에서 사용자 확인 질문으로 연결해야 한다.
