# MCP Security Checklist

- [ ] MCP 서버 목적이 명확하다.
- [ ] risk level이 정의되어 있다.
- [ ] high/destructive MCP는 승인자가 있다.
- [ ] plaintext secret을 사용하지 않는다.
- [ ] 필요한 env var가 문서화되어 있다.
- [ ] allowed operation과 denied operation이 분리되어 있다.
- [ ] local filesystem 접근 범위가 제한되어 있다.
- [ ] network 접근 범위가 제한되어 있다.
- [ ] selection log와 runtime log의 납품 제외 여부가 확인되어 있다.
- [ ] 고객 계약, 보안, 감사 요구와 충돌하지 않는다.
