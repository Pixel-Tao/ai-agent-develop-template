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

## README 초기화 규칙

- 생성 직후 README.md는 템플릿 설명일 수 있지만, 초기화 완료 후에는 현재 프로젝트의 목적, 실행/검증 방법, 문서 구조를 설명해야 한다.
- INIT.md에는 README.md 재작성 전에 기존 README.md를 docs/09_agent_state/archive/init/original-README-{{YYYY-MM-DD}}.md로 보관하는 절차를 포함한다.
- README.en.md가 있는 템플릿은 README.md와 함께 동기화하거나, 즉시 갱신할 수 없으면 README.en.md와 run-log에 갱신 필요 상태를 명시하도록 안내한다.
- docs/09_agent_state/archive/init/init-archive-log.md에는 README 보관 위치와 README.en.md 동기화 상태를 기록할 컬럼을 둔다.

## `skills/` 작성 규칙

- `skills/skills-index.yaml`에 모든 Skill을 등록한다.
- `skills/skills-sh-recommendations.yaml`에는 기술 스택 감지 규칙, skills.sh에서 검색할 키워드, 검토할 외부 Skill source를 등록한다.
- `skills/selected-skills.md`에는 초기화 중 검토한 Skill 후보와 적용/제외 사유를 기록할 표를 둔다.
- Skill 문서는 입력, 절차, 출력, 검증 기준을 분리한다.
- 템플릿 특화 Skill이 아니라면 `common/base-skills/` 재사용을 우선한다.

## `delivery/` 작성 규칙

- `delivery/sanitize-policy.yaml`에 납품, 내부 아카이브, 삭제 가능, 검토 필요 대상을 분류한다.
- 납품 제외는 경로 기반 정책으로 정의하고 단순 키워드 기반 제외를 피한다.
- `production-agent-system`처럼 제품 코드에 agent/runtime/tool 용어가 있는 템플릿은 제품 코드와 Agent 운영자료를 명확히 구분한다.

## `mcp/` 작성 규칙

- `mcp/mcp-policy.yaml`에는 MCP 자동 설치/시작 금지, risk level, secret, audit, delivery 기준을 둔다.
- `mcp/mcp-servers.yaml`에는 후보 MCP의 목적, transport, risk level, credential, allowed/denied operation을 기록한다.
- `mcp/mcp-selection-log.md`에는 선택/보류/거절 사유를 기록할 표를 둔다.
- high/destructive MCP 후보는 승인자 없이 활성화할 수 없다.
- 제품 runtime tool/MCP bridge와 Agent 운영용 MCP를 혼동하지 않는다.

## 테스트 추가 규칙

- 새 템플릿은 `npm run validate`를 통과해야 한다.
- 생성 smoke test에서 zip 생성, 필수 파일, unresolved placeholder, delivery 구조를 검증해야 한다.
- Delivery test에서 clean package에 Agent 운영자료가 없는지 확인해야 한다.
