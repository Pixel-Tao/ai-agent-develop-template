# Delivery Validation Rules

## 금지 경로

납품 패키지에는 Agent 운영자료가 포함되면 안 된다.

- `AGENTS.md`
- `CLAUDE.md`
- `INIT.md`
- `skills/`
- `harness/`
- `docs/09_agent_state/`

## Placeholder

`{{PROJECT_ID}}`, `{{PROJECT_NAME}}`, `{{OWNER_NAME}}`, `{{YYYY-MM-DD}}` 같은 unresolved placeholder가 남아 있으면 실패한다.

## 수동 검토

라이선스, 보안 문서, 감사 증적, 계약상 납품 범위는 자동 판단하지 않고 report에 검토 항목으로 남긴다.
