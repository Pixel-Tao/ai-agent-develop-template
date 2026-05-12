# Harness Commands

이 문서는 프로젝트에서 반복 실행해야 하는 명령을 한곳에 모은다. Agent는 명령을 추정해서 확정하지 말고, 실제 프로젝트에서 확인한 명령과 아직 확인이 필요한 명령을 분리해야 한다.

## Command Inventory

| Command ID | 목적 | 명령 | 실행 위치 | 입력 | 산출물 | 상태 | 비고 |
|---|---|---|---|---|---|---|---|
| role-specific-test | role-specific test | TBD | TBD | TBD | TBD | draft | 프로젝트에 맞게 확인 필요 |
| integration-test | integration test | TBD | TBD | TBD | TBD | draft | 프로젝트에 맞게 확인 필요 |
| review-checklist | review checklist | TBD | TBD | TBD | TBD | draft | 프로젝트에 맞게 확인 필요 |
| release-readiness | release readiness | TBD | TBD | TBD | TBD | draft | 프로젝트에 맞게 확인 필요 |

## Execution Rules

- 명령 실행 전 작업 범위와 기대 결과를 기록한다.
- 실패한 명령은 삭제하지 말고 원인, 로그 위치, 다음 조치를 남긴다.
- 운영/보안/데이터 영향이 있는 명령은 승인 필요 여부를 먼저 확인한다.
