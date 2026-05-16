# Delivery

이 폴더는 개발 완료 후 납품 패키지와 내부 아카이브를 분리하기 위한 정책, 체크리스트, 검증 결과를 보관한다.

## 주요 파일

- `sanitize-policy.yaml`: 납품 포함/제외/아카이브 정책
- `delivery-manifest.yaml`: 납품 패키지 메타데이터
- `delivery-checklist.md`: 납품 전 확인 항목
- `archive-checklist.md`: 내부 아카이브 확인 항목
- `purge-checklist.md`: 삭제 전 승인 조건
- `reports/`: 납품 검증 보고서

## 원칙

원본 저장소 파일은 삭제하지 않는다. 납품 패키지는 `dist/delivery/`에 별도로 생성하고, Agent 운영자료는 내부 아카이브 대상으로 분류한다.
