# Harness Runbook

하네스는 작업을 시작하기 전, 변경 중, 완료 직전에 반복해서 사용한다. 목적은 실행 가능한 명령과 검증 증거를 남겨 다음 Agent나 사람이 같은 판단을 재현할 수 있게 하는 것이다.

## 1. Prepare

- manifest.yaml과 AGENTS.md를 읽는다.
- harness/harness.yaml과 harness/commands.md를 확인한다.
- 초기 개발 문서가 있으면 inputs/source-documents-index.md를 확인한다.

## 2. Execute

- 작업 유형에 맞는 Skill을 선택한다.
- 필요한 명령을 commands.md에서 찾고 없으면 후보로 기록한다.
- 실행 결과를 evidence-log.md에 남긴다.

## 3. Verify

- verification-matrix.md의 최소 검증을 충족했는지 확인한다.
- 검증 불가 항목은 blocker, assumption, risk로 분리한다.
- 작업 완료 보고에는 검증 결과와 증거 위치를 포함한다.
