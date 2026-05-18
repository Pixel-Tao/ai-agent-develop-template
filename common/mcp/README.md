# MCP Control

## 목적

MCP(Model Context Protocol) 서버와 외부 capability를 프로젝트 초기화 단계에서 안전하게 검토, 승인, 기록하기 위한 공통 구조다.

## 기본 원칙

- MCP 서버는 기본적으로 자동 설치하거나 자동 시작하지 않는다.
- 외부 시스템, 로컬 파일, credential, 고객 데이터에 접근할 수 있으므로 Skill보다 엄격하게 검토한다.
- 각 MCP 후보는 목적, 위험도, transport, 접근 범위, credential 필요 여부, 승인 상태를 기록한다.
- 승인되지 않은 MCP는 활성화하지 않는다.
- 실행 로그, local config, selection log는 납품 패키지에서 제외하거나 review_required로 분류한다.

## 공통 파일

- `mcp-policy.template.yaml`: MCP 사용 정책 템플릿
- `mcp-servers.template.yaml`: MCP 후보 서버 목록 템플릿
- `mcp-selection-guide.md`: 후보 선정과 검토 절차
- `mcp-security-checklist.md`: 보안 검토 체크리스트
- `validation-rules.md`: validator가 확인해야 할 규칙

## 권장 흐름

1. 필요한 외부 capability를 식별한다.
2. MCP 후보를 조사하고 `mcp/mcp-servers.yaml`에 기록한다.
3. 위험도, credential, data scope, allowed/denied operation을 검토한다.
4. 승인된 MCP만 활성화한다.
5. 결정과 근거를 `mcp/mcp-selection-log.md`와 run log에 남긴다.
