# Template Usage Guide

## 1. 템플릿 선택

decision-guide.md를 읽고 프로젝트의 현재 상태, 팀 규모, 위험 수준, 도메인 요구사항을 기준으로 템플릿을 고른다. 하나의 템플릿으로 부족하면 기본 템플릿을 정한 뒤 필요한 전문 폴더만 병합한다.

## 2. 프로젝트에 복사

선택한 templates/{template-id}/ 폴더의 내용을 대상 프로젝트 루트에 복사한다. 기존 파일이 있으면 덮어쓰지 말고 차이를 비교한 뒤 수동으로 병합한다.

## 3. 변수 치환

{{PROJECT_NAME}}, {{PROJECT_ID}}, {{OWNER_NAME}}, {{YYYY-MM-DD}}를 실제 값으로 치환한다. 값이 아직 정해지지 않았으면 docs/09_agent_state/assumptions.md 또는 템플릿의 assumptions 문서에 추정값과 근거를 기록한다.

## 4. Agent 지침 확인

작업 전 AGENTS.md와 manifest.yaml을 확인한다. 역할 기반 템플릿은 루트 AGENTS.md가 Router 역할을 하므로, 실제 작업자는 agents/ 아래의 역할별 문서도 읽어야 한다.

## 5. Skill 활성화

skills/skills-index.yaml을 확인하고 작업 성격에 맞는 Skill을 선택한다. Skill 문서의 입력, 절차, 품질 기준에 맞지 않는 작업은 assumptions 또는 blockers에 기록한다.

## 6. 초기 작업 등록

초기 분석, 요구사항 정리, 위험 식별, 테스트 확인 작업을 backlog 또는 work allocation에 등록한다. 작업 로그는 항상 지정된 run log에 남기고, 다음 담당자가 이어받을 수 있게 handoff notes를 유지한다.

## 7. 검증 체크리스트

validation-checklist.md를 사용해 필수 파일, 문서 구조, Skill 구조, Agent 작업성을 확인한다. 템플릿별 특수 문서가 빠졌다면 완료로 판단하지 않는다.

## 8. 프로젝트 발견 인터뷰

템플릿을 복사한 직후 바로 구현하지 말고, 먼저 project-discovery-interview.md를 사용해 사용자의 아이디어를 구체화한다. 인터뷰 결과는 project-definition-brief로 요약하고, 이후 PRD, architecture, backlog, acceptance criteria 작성의 기준으로 사용한다.

## 9. 변수 일괄 치환

`scripts/template-variables.example.yaml`을 복사해 프로젝트 값으로 수정한 뒤 `scripts/replace-template-variables.ps1`을 실행한다. 예: `powershell -ExecutionPolicy Bypass -File scripts/replace-template-variables.ps1 -RootPath . -VariablesFile scripts/template-variables.example.yaml`. 기본은 Dry Run이며, 확인 후 `-Apply`를 붙이면 실제 치환이 적용된다.

## 범용 변수 치환

macOS, Linux, Windows 공통으로는 Node.js 스크립트를 사용한다. 예: `node scripts/replace-template-variables.mjs --root . --variables-file scripts/template-variables.example.yaml`. 기본은 Dry Run이며, 확인 후 `--apply`를 붙이면 실제 치환이 적용된다. Windows PowerShell만 사용하는 경우에는 `scripts/replace-template-variables.ps1`을 사용할 수 있다.
