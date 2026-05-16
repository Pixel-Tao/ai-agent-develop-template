# Delivery Sanitization Guide

## 개요

개발 완료 시점에 납품 패키지와 내부 아카이브를 분리하는 방법을 설명한다.

## 산출물

- `dist/delivery/`: 고객 전달용 clean package
- `dist/internal-archive/`: 내부 보관용 archive
- `delivery/reports/`: 검증 결과와 검토 항목

## 절차

1. `delivery/sanitize-policy.yaml`을 최신 상태로 갱신한다.
2. `node scripts/archive-agent-workspace.mjs --policy delivery/sanitize-policy.yaml --output dist/internal-archive`를 실행한다.
3. `node scripts/create-delivery-package.mjs --policy delivery/sanitize-policy.yaml --output dist/delivery`를 실행한다.
4. `node scripts/validate-delivery-clean.mjs --package <zip> --policy delivery/sanitize-policy.yaml`을 실행한다.
5. 실패 항목을 수정하거나 `review_required`로 남긴다.

## 판단 기준

납품본은 깨끗해야 하고, 내부 추적성은 보존되어야 한다. 삭제보다 아카이브가 우선이며, 자동화보다 검증이 우선이다.
