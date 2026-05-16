# Template Authoring Guide

## 새 템플릿 작성 규칙

템플릿은 Agent가 처음 읽을 진입점, 사람이 검토할 문서, 자동 검증 가능한 구조를 함께 제공해야 한다.

## `template.yaml` 규칙

- `id`는 `templates-index.yaml`의 id와 일치해야 한다.
- `required_files`에는 생성 후 반드시 있어야 하는 파일을 포함한다.
- `updated_at`은 `{{YYYY-MM-DD}}` placeholder를 사용한다.

## `manifest.yaml` 규칙

- `project.id`는 `{{PROJECT_ID}}`를 사용한다.
- `project.name`은 `{{PROJECT_NAME}}`을 사용한다.
- `lifecycle.status`는 `{{PROJECT_STATUS}}`를 사용한다.
- `delivery` 설정은 납품 정리 정책과 출력 위치를 명시한다.

## `skills/` 작성 규칙

- `skills/skills-index.yaml`에 모든 Skill을 등록한다.
- Skill 문서는 입력, 절차, 출력, 검증 기준을 분리한다.
- 템플릿 특화 Skill이 아니라면 `common/base-skills/` 재사용을 우선한다.

## `delivery/` 작성 규칙

- `delivery/sanitize-policy.yaml`에 납품, 내부 아카이브, 삭제 가능, 검토 필요 대상을 분류한다.
- 납품 제외는 경로 기반 정책으로 정의하고 단순 키워드 기반 제외를 피한다.
- `production-agent-system`처럼 제품 코드에 agent/runtime/tool 용어가 있는 템플릿은 제품 코드와 Agent 운영자료를 명확히 구분한다.

## 테스트 추가 규칙

- 새 템플릿은 `npm run validate`를 통과해야 한다.
- 생성 smoke test에서 zip 생성, 필수 파일, unresolved placeholder, delivery 구조를 검증해야 한다.
- Delivery test에서 clean package에 Agent 운영자료가 없는지 확인해야 한다.
