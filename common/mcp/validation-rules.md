# MCP Validation Rules

Validator는 다음을 확인한다.

- 모든 템플릿에 `mcp/mcp-policy.yaml`이 있다.
- 모든 템플릿에 `mcp/mcp-servers.yaml`이 있다.
- 모든 템플릿에 `mcp/mcp-selection-log.md`가 있다.
- 모든 템플릿에 `mcp/reports/.gitkeep`이 있다.
- MCP 후보는 `id`, `purpose`, `status`, `risk_level`, `transport`, `approval`, `credentials`, `allowed_operations`, `denied_operations`를 가진다.
- `risk_level`은 `low`, `medium`, `high`, `destructive` 중 하나다.
- `high` 또는 `destructive` 후보는 approval required가 true다.
- plaintext secret은 허용하지 않는다.
- delivery exclude에는 MCP local report/config 경로가 포함된다.
