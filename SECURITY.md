# Security Policy

## 취약점 신고

보안 취약점은 공개 이슈에 상세 재현 정보나 민감정보를 올리지 말고 저장소 관리자에게 비공개 채널로 전달한다. 공개 채널을 사용해야 하는 경우에는 영향 범위와 재현 세부정보를 최소화한다.

## 민감정보 포함 금지

- API key, token, private key, password, 실제 고객 데이터는 템플릿과 예시에 포함하지 않는다.
- Agent run log, prompt log, tool call trace에 민감정보가 들어갈 수 있으므로 납품 전 delivery sanitization 검증을 실행한다.
- `delivery/sanitize-policy.yaml`에서 보안·감사·라이선스 자료는 `never_delete_without_review` 또는 `review_required`로 분류한다.

## Delivery Sanitization 주의사항

Delivery Sanitization은 감사 회피나 기록 삭제 목적이 아니다. 고객 납품본에서 내부 Agent 운영자료를 제외하고, 보존 의무가 있을 수 있는 자료는 내부 아카이브로 분리하기 위한 절차다.
