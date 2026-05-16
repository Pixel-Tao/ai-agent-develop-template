# Delivery Checklist

## 납품 범위 확인

- [ ] 납품 대상 파일과 제외 파일이 정의되어 있다.
- [ ] `delivery/sanitize-policy.yaml`이 최신이다.
- [ ] 계약상 필요한 문서가 포함되어 있다.
- [ ] 라이선스/NOTICE 파일 포함 여부를 확인했다.

## Agent 운영자료 제외

- [ ] `AGENTS.md` 제외
- [ ] `CLAUDE.md` 제외
- [ ] `INIT.md` 제외
- [ ] `skills/` 제외
- [ ] `harness/` 제외
- [ ] `inputs/` 제외
- [ ] `outputs/` 제외
- [ ] `docs/09_agent_state/` 제외

## 검증

- [ ] delivery package 생성 완료
- [ ] delivery clean 검증 완료
- [ ] unresolved placeholder 없음
- [ ] 내부 로그 또는 Agent trace 없음
- [ ] 필수 소스와 문서 포함

## 보고

- [ ] `delivery/reports/delivery-clean-report.md` 생성
- [ ] `delivery/delivery-manifest.yaml` 갱신
