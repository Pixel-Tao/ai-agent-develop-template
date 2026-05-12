# Template Usage Guide

## 1. 템플릿 선택

decision-guide.md를 보고 프로젝트 상황에 맞는 템플릿을 고른다. 확신이 없으면 가장 가까운 기본 템플릿을 선택하고, 필요한 전문 폴더만 나중에 병합한다.

## 2. 프로젝트에 복사

templates/{template-id}/ 안의 파일과 폴더를 대상 프로젝트 루트로 복사한다. 기존 프로젝트에 적용할 때는 같은 이름의 파일을 바로 덮어쓰지 말고 내용을 비교해 병합한다.

## 3. 변수 치환

scripts/template-variables.example.yaml을 복사해 프로젝트 값으로 수정한다. 기본 owner 예시는 your-name이다.

    node scripts/replace-template-variables.mjs --root . --variables-file scripts/template-variables.example.yaml
    node scripts/replace-template-variables.mjs --root . --variables-file scripts/template-variables.example.yaml --apply

Windows PowerShell만 사용할 경우 scripts/replace-template-variables.ps1을 사용할 수 있다.

## 4. 초기 개발 문서 추가

사용자가 이미 가진 기획서, 메모, 요구사항 초안, 화면 스케치, 회의록, 참고 링크를 inputs/initial-development-docs/ 또는 inputs/references/에 넣는다. Agent는 inputs/source-documents-index.md에 문서를 등록하고, 문서 내용을 사실/추정/충돌/질문으로 분리한다.

## 5. Agent 지침 확인

Agent는 작업 전에 다음 파일을 읽는다.

- AGENTS.md
- manifest.yaml
- inputs/source-documents-index.md
- docs/09_agent_state/current-status.md

역할 기반 템플릿은 루트 AGENTS.md를 Router로 보고, 실제 작업 역할에 맞는 agents/*.md를 추가로 읽는다.

## 6. 인터뷰로 구체화

바로 구현하지 말고 Project Discovery Interview를 먼저 실행한다. 목표, 사용자, 기능 범위, 기술 스택, 콘텐츠, 성공 기준, 제외 범위, 위험 요소를 확인해 project-definition-brief.md 또는 해당 템플릿의 요구사항 문서에 반영한다.

## 7. 검증

validation-checklist.md로 필수 파일, Agent 진입점, Skill 구조, 작업 로그 위치, assumptions 기록 위치를 확인한다. 누락된 항목이 있으면 구현 전에 먼저 보완한다.
