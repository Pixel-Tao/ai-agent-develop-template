# MCP Selection Guide

## 절차

1. 프로젝트가 필요한 외부 capability를 나열한다.
2. capability별 MCP 후보를 조사한다.
3. 후보별 목적, transport, credential, data scope, allowed/denied operation을 기록한다.
4. `mcp/mcp-policy.yaml`의 risk rule에 따라 승인 필요 여부를 확인한다.
5. 승인된 MCP만 활성화한다.
6. 선택/보류/거절 사유를 `mcp/mcp-selection-log.md`에 기록한다.

## 검토 기준

- 고객 데이터 접근 여부
- credential 필요 여부
- local filesystem 접근 범위
- network 접근 범위
- destructive operation 가능성
- license와 유지보수 상태
- 납품 패키지 포함 여부
