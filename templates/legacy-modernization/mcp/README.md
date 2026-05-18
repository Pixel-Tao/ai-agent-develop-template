# MCP Control

이 폴더는 프로젝트에서 사용할 MCP 서버 후보와 사용 정책을 관리한다.

- `mcp-policy.yaml`: MCP 사용 정책, risk level, secret, audit, delivery 기준
- `mcp-servers.yaml`: MCP 후보 서버와 접근 범위
- `mcp-selection-log.md`: 선택/보류/거절 결정 기록
- `reports/`: MCP 검토 또는 검증 report

MCP 서버는 외부 시스템, 로컬 파일, credential, 고객 데이터에 접근할 수 있으므로 기본적으로 자동 설치하거나 자동 시작하지 않는다.
