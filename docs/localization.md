# 문서 언어 정책

## 원칙

- 한국어 문서가 기본이며 원본 역할을 한다.
- 영어 문서는 같은 위치의 `.en.md` sidecar 파일로 제공한다.
- 새로 추가하는 루트 가이드와 템플릿 진입점 README는 한국어 원본과 영어판을 함께 추가한다.
- 영어판은 한국어 문서의 의미를 전달하는 companion 문서이며, 변경이 생기면 한국어 문서를 먼저 갱신한 뒤 영어판을 동기화한다.

## 파일 명명 규칙

| 한국어 원본 | 영어판 |
|---|---|
| `README.md` | `README.en.md` |
| `decision-guide.md` | `decision-guide.en.md` |
| `template-usage-guide.md` | `template-usage-guide.en.md` |

## 현재 필수 영어판 범위

- 루트 사용자 문서: `README`, `decision-guide`, `template-usage-guide`
- `scripts/README`
- `common/README`
- 각 템플릿의 최상위 `README`

세부 도메인 문서, 스킬 예시, 체크리스트는 한국어를 기본으로 유지한다. 영어판이 필요한 경우 같은 위치에 `.en.md`를 추가한다.

## 검증

`npm run validate`는 필수 영어 sidecar 문서가 존재하는지 확인한다.
