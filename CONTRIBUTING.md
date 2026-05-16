# Contributing

## 기본 원칙

- 한국어 문서가 기본이며 영어판은 `.en.md` sidecar로 관리한다.
- 기존 템플릿 구조와 명명 규칙을 우선한다.
- 새 템플릿은 생성기, validator, smoke test가 모두 통과해야 한다.
- Agent 운영자료와 납품 산출물의 경계를 명확히 유지한다.

## 템플릿 추가 방법

1. `templates/{template-id}/`를 추가한다.
2. `templates-index.yaml`에 템플릿을 등록한다.
3. 필수 파일을 추가한다.
4. `README.md`와 `README.en.md`를 함께 작성한다.
5. `delivery/`, `.deliveryignore`, `.agentignore`를 추가한다.
6. `manifest.yaml`에 `lifecycle`과 `delivery` 설정을 포함한다.
7. 생성기 테스트와 delivery 테스트를 실행한다.

## 필수 파일

- `README.md`
- `README.en.md`
- `AGENTS.md`
- `CLAUDE.md`
- `INIT.md`
- `manifest.yaml`
- `template.yaml`
- `validation-checklist.md`
- `skills/skills-index.yaml`
- `harness/harness.yaml`
- `harness/commands.md`
- `harness/verification-matrix.md`
- `harness/evidence-log.md`
- `delivery/sanitize-policy.yaml`
- `delivery/delivery-manifest.yaml`
- `.deliveryignore`
- `.agentignore`

## 검증

```bash
npm run validate
npm run test:generator
npm run test:generator:all
npm run test:delivery
```

## PR 체크리스트

- [ ] 템플릿 인덱스와 디렉터리가 일치한다.
- [ ] 필수 파일이 모두 있다.
- [ ] 영어 companion 문서가 필요한 위치에 추가되어 있다.
- [ ] delivery sanitization 정책이 있다.
- [ ] 생성 결과에 unresolved placeholder가 없다.
- [ ] 테스트와 validator 결과를 PR에 기록했다.
