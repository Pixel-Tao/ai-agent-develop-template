# Harness Engineering

이 폴더는 MVP Prototype 템플릿에서 작업을 반복 가능하게 수행하기 위한 하네스다. 목적은 빠른 실험을 위해 최소 실행/검증/피드백 루프만 유지한다.

Agent는 구현 전에 이 폴더를 읽고 실제 프로젝트에서 사용할 실행 명령, 검증 기준, 증거 위치를 확인해야 한다. 아직 확인되지 않은 명령은 TBD로 남기고 사용자 또는 저장소 문서에서 확인한다.

## 사용 순서

1. harness/harness.yaml로 목적과 품질 게이트를 확인한다.
2. harness/commands.md에서 실행 가능한 명령을 찾는다.
3. harness/verification-matrix.md에서 작업 유형별 최소 검증을 선택한다.
4. 실행 결과를 harness/evidence-log.md에 기록한다.
5. 산출물은 harness/reports/에 둔다.
