# Agent Instructions

## 역할

AI Agent는 Maintenance Operations 템플릿 기준으로 프로젝트 구조, 현재 상태, 위험 요소를 먼저 파악한 뒤 요청된 작업을 수행한다. 운영 안정성을 우선한다. 변경 전 영향 범위를 확인한다. 장애 대응 문서는 시간순으로 기록한다. 릴리즈 전 체크리스트를 완료해야 한다. rollback 경로가 없는 운영 변경은 고위험으로 표시한다.

## 기본 원칙

기존 파일은 함부로 덮어쓰지 않는다. 불확실한 내용은 assumptions 또는 unknowns에 기록하고, 승인 필요한 변경은 완료로 판단하지 않는다.

## 우선 읽을 파일

1. README.md
2. manifest.yaml
3. AGENTS.md
4. docs/09_agent_state/current-status.md
5. skills/skills-index.yaml

## Skill 사용 규칙

작업 성격에 맞는 Skill을 선택한다. Skill 문서가 부족하면 가장 가까운 Skill을 사용하고 부족한 점을 run log에 기록한다.

## 문서 작성 규칙

문서는 Markdown, 메타데이터는 YAML을 사용한다. 파일명은 lower-kebab-case, 날짜는 YYYY-MM-DD 형식을 따른다.

## 코드 작업 규칙

변경 전 영향 범위를 기록한다. 관련 없는 리팩터링은 하지 않으며, 기존 컨벤션과 테스트 방식을 우선한다.

## 테스트 규칙

가장 작은 관련 테스트나 검증을 실행한다. 실행할 수 없으면 이유와 남은 위험을 run log에 기록한다.

## 작업 로그 규칙

작업 시작, 확인한 문서, 변경 파일, 검증 결과, 다음 작업을 docs/09_agent_state/run-log.md에 기록한다.

## 금지사항

승인 없이 삭제, 대규모 리팩터링, 공개 API 변경, 보안 정책 변경을 하지 않는다. 민감정보를 코드, 로그, 문서에 기록하지 않는다.

## 작업 완료 보고 형식

- 수행한 작업
- 변경 또는 생성한 파일
- 검증 결과
- 남은 위험과 assumptions
- 다음 권장 작업

## 프로젝트 발견 인터뷰 규칙

사용자의 요청이 대략적이거나 목표, 사용자, 성공 기준, 기술 범위가 불명확하면 먼저 project-discovery-interview.md와 project-discovery-interview Skill을 사용한다. Agent는 모호한 답변을 임의로 확정하지 않고, 결정/가정/미정을 분리해 기록한 뒤 project-definition-brief를 기준으로 다음 문서를 작성한다.

## 초기 개발 문서 확인 규칙

작업 시작 전에 inputs/README.md와 inputs/source-documents-index.md를 확인한다. 사용자가 초기 기획서, 요구사항 초안, 메모, 스케치, 회의록, 레퍼런스를 넣어둔 경우 이를 먼저 요약하고, Project Discovery Interview에서 확인 질문으로 연결한다. 원본 문서 내용은 확정 요구사항이 아니라 사용자 확인이 필요한 근거로 취급한다.

## 하네스 엔지니어링 규칙

작업을 시작하기 전에 harness/README.md, harness/harness.yaml, harness/commands.md, harness/verification-matrix.md를 확인한다. Agent는 실행한 명령과 검증 결과를 harness/evidence-log.md에 기록하고, 테스트/리포트/스크린샷 같은 산출물은 harness/reports/에 둔다. 실행하지 않은 검증은 완료로 보고하지 않으며, 불가능한 검증은 이유와 대체 확인 방법을 기록한다.
