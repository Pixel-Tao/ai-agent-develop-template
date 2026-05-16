# Delivery Sanitization

## 목적

Delivery Sanitization은 개발 완료 후 고객에게 전달할 clean package와 내부 보관용 archive를 분리하기 위한 절차다. 납품 패키지는 원본 소스, 테스트, 필수 문서, 라이선스, 배포 관련 산출물만 포함하고 AI Agent 운영자료는 제외한다.

## 언제 사용하는가

- 프로젝트가 `pre-delivery` 또는 `delivery-sanitization` 상태에 들어갔을 때
- Agent 작업 로그, Skill, harness, inputs, assumptions를 납품 범위에서 분리해야 할 때
- 내부 추적성은 보존하되 고객 납품본은 정리된 형태로 제공해야 할 때

## 납품 패키지와 내부 아카이브의 차이

납품 패키지는 고객에게 전달할 산출물이다. 내부 아카이브는 하자보수, 내부 감사, 추적성을 위한 보관 자료다. 삭제는 마지막 선택지이며, 보존 의무가 있을 수 있는 자료는 archive 대상으로 분류한다.

## 기본 원칙

- 원본 작업 저장소는 보존한다.
- 납품 패키지는 별도 output으로 생성한다.
- Agent 운영자료는 납품 패키지에서 제외한다.
- 계약, 감사, 보안, 라이선스상 보존 가능성이 있는 자료는 삭제하지 않는다.
- 불확실한 항목은 `review_required`로 표시한다.
- 검증하지 않은 납품 패키지는 완료로 보지 않는다.

## 공통 파일 설명

| 파일 | 설명 |
|---|---|
| `sanitize-policy.template.yaml` | 납품 포함/제외/아카이브 정책 템플릿 |
| `delivery-manifest.template.yaml` | 납품 패키지 메타데이터 템플릿 |
| `delivery-checklist.md` | 납품 전 확인 항목 |
| `archive-checklist.md` | 내부 아카이브 확인 항목 |
| `purge-checklist.md` | 삭제 전 승인 조건 |
| `validation-rules.md` | clean package 검증 기준 |

## 권장 작업 흐름

1. `delivery/sanitize-policy.yaml`에서 납품 범위를 확인한다.
2. `scripts/archive-agent-workspace.mjs`로 내부 아카이브를 생성한다.
3. `scripts/create-delivery-package.mjs`로 납품 패키지를 생성한다.
4. `scripts/validate-delivery-clean.mjs`로 clean 검증을 실행한다.
5. 검증 결과와 남은 검토 항목을 `delivery/reports/`에 기록한다.

## 주의사항

AI Agent 흔적을 감추기 위해 감사·보안·라이선스 기록을 삭제하면 안 된다. 납품본에서 제외해야 하는 자료와 내부적으로 보존해야 하는 자료를 분리하고, 삭제는 명시적 승인과 정책이 있을 때만 수행한다.
