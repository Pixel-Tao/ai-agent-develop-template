# Project Init Prompt

이 문서는 생성된 프로젝트에서 초기 설정을 시작할 때 한 번만 사용하는 활성 프롬프트다. 사용자가 `init`, `/init`, `초기화`, `프로젝트 시작`을 요청하면 Agent는 이 문서를 읽고 순서대로 실행한다.

## 목적

- 사용자의 막연한 아이디어를 구체적인 프로젝트 정의로 정리한다.
- inputs/에 들어온 초기 개발 문서가 있으면 문서 기반 인터뷰로 시작한다.
- 초기 문서가 없으면 대화형 Project Discovery Interview로 시작한다.
- harness/를 현재 프로젝트에 맞게 초기화한다.
- 초기 설정이 끝나면 이 INIT 문서를 아카이브해 다시 실행되지 않게 한다.

## 먼저 읽을 파일

1. AGENTS.md
2. manifest.yaml
3. inputs/README.md
4. inputs/source-documents-index.md
5. harness/harness.yaml
6. harness/commands.md
7. harness/verification-matrix.md
8. docs/09_agent_state/current-status.md
9. skills/skills-index.yaml
10. skills/skills-sh-recommendations.yaml
11. mcp/mcp-policy.yaml
12. mcp/mcp-servers.yaml

## Skill 구성 초기화

초기 인터뷰와 문서 확인 후 Agent는 일반 Skill만 보지 말고, 프로젝트의 실제 기술 스택을 먼저 식별한 뒤 stack-specific Skill을 적극적으로 검색한다.

1. 추천 검색어, 후보 source, 스택 감지 규칙을 확인한다.

   ```bash
   cat skills/skills-sh-recommendations.yaml
   ```

2. 프로젝트 파일과 `inputs/` 자료를 스캔해 기술 스택 증거를 찾는다.

   - Node.js: `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `tsconfig.json`
   - .NET: `*.sln`, `*.csproj`, `Directory.Build.props`, `global.json`
   - Python: `pyproject.toml`, `requirements.txt`, `uv.lock`, `poetry.lock`
   - Java: `pom.xml`, `build.gradle`
   - Go: `go.mod`
   - Rust: `Cargo.toml`
   - Infra: `Dockerfile`, `docker-compose.yml`, Terraform, Kubernetes, Helm

3. 감지한 각 스택마다 `skills/skills-sh-recommendations.yaml`의 `stack_detection.query_sets`를 사용해 skills.sh에서 구체 Skill을 검색한다.

   ```bash
   npx skills find "nodejs typescript"
   npx skills find "dotnet csharp aspnet"
   npx skills find "python pytest"
   ```

   CLI 검색이 환경에서 동작하지 않으면 `https://www.skills.sh/`에서 같은 query로 검색한다.

4. 검색 후보를 바로 설치하지 말고 다음 기준으로 검토한다.

   - source 신뢰도
   - license
   - 유지보수 상태
   - 프로젝트 적합성
   - 보안/납품 정리 정책 충돌 여부

5. 검토를 통과한 Skill만 설치한다.

   ```bash
   npx skills add <owner/repo>
   ```

   익명 telemetry를 비활성화해야 하면 다음 형식을 사용한다.

   ```bash
   DISABLE_TELEMETRY=1 npx skills add <owner/repo>
   ```

6. 설치한 Skill, 제외한 후보, 제외 사유, 적합한 Skill이 없었던 query를 기록한다.

   - `skills/selected-skills.md`
   - `docs/09_agent_state/run-log.md`
   - 필요 시 `docs/09_agent_state/assumptions.md`

적합한 Skill이 없으면 "검토했지만 적용하지 않음"을 명시한다. 필요한 경우 프로젝트 전용 임시 Skill 작성 여부를 제안하되, 외부 Skill은 프로젝트 요구와 보안 정책에 맞을 때만 추가한다.


## MCP 구성 초기화

Agent는 필요한 외부 capability를 식별하고, 승인된 MCP만 활성화한다. MCP는 외부 시스템, 로컬 파일, credential, 고객 데이터에 접근할 수 있으므로 Skill보다 엄격하게 검토한다.

1. `mcp/mcp-policy.yaml`과 `mcp/mcp-servers.yaml`을 읽는다.
2. 프로젝트에 필요한 capability를 식별한다.

   - repository, issue, pull request
   - local filesystem inspection
   - database inspection
   - cloud deployment
   - browser automation
   - observability, incident, support tools
   - collaboration tools such as Slack, Teams, Notion, calendar

3. 각 MCP 후보의 목적, risk level, transport, credential, allowed operation, denied operation, data scope를 검토한다.
4. `high` 또는 `destructive` risk MCP는 승인 없이 활성화하지 않는다.
5. secret은 plaintext로 저장하지 않고 필요한 env var만 기록한다.
6. 승인/보류/거절 결정을 `mcp/mcp-selection-log.md`와 `docs/09_agent_state/run-log.md`에 기록한다.

적합한 MCP가 없으면 "검토했지만 활성화하지 않음"을 명시한다. 프로젝트에 제품 runtime용 tool/MCP bridge가 있다면 Agent 운영용 MCP와 혼동하지 않는다.


## 1. 초기 문서 확인

다음 위치를 확인한다.

- inputs/initial-development-docs/
- inputs/references/
- inputs/source-documents-index.md

.gitkeep을 제외한 파일이나 실제 링크가 있으면 문서 기반 인터뷰로 진행한다. 문서가 없거나 source-documents-index.md가 비어 있으면 대화형 인터뷰로 진행한다.

## 2. 문서 기반 인터뷰

초기 문서가 있으면 먼저 다음을 정리한다.

| 구분 | 기록 내용 |
|---|---|
| 확인된 사실 | 문서에 직접 적힌 내용 |
| 추정 | Agent가 해석한 내용 |
| 충돌 | 문서끼리 다르거나 사용자 확인이 필요한 내용 |
| 질문 | 인터뷰에서 확인해야 할 내용 |

문서 내용을 확정 요구사항으로 단정하지 않는다. 모든 추정과 충돌은 사용자에게 확인한다.

## 3. 템플릿 맞춤 인터뷰

이 템플릿은 보안, 개인정보, 감사, 규제 요구사항이 중요한 프로젝트에 사용한다. 인터뷰는 기능보다 데이터 분류, 권한 경계, 승인 책임, 감사 증거를 먼저 확인한다. 불확실한 보안 요구사항은 단정하지 말고 threat model 또는 compliance matrix의 확인 질문으로 남긴다.

1. 이 프로젝트가 다루는 데이터는 공개, 내부, 기밀, 개인정보, 결제, 의료, 금융, 공공 데이터 중 무엇인가?
2. 적용 가능성이 있는 규제, 계약, 내부 보안 정책, 감사 요구사항은 무엇인가?
3. 사용자 역할, 권한 경계, 관리자 기능, 외부 접근 경로는 무엇인가?
4. 인증/인가, 세션, 토큰, API 접근 제어에서 반드시 지켜야 할 기준은 무엇인가?
5. 민감정보는 어디에서 수집, 저장, 처리, 전송, 삭제되는가?
6. 로그, 분석, 모니터링, 에러 리포트에 남기면 안 되는 정보는 무엇인가?
7. 비밀값, 키, 인증서, 환경 변수는 누가 어떻게 관리해야 하는가?
8. 보안 승인이나 컴플라이언스 승인이 필요한 변경 유형은 무엇인가?
9. 감사 증거로 남겨야 하는 산출물과 보관 위치는 무엇인가?
10. 첫 번째로 안전하게 정의해야 할 보안 통제 또는 위협 모델 범위는 무엇인가?

## 4. 프로젝트 정의 산출물

인터뷰 결과를 다음 문서에 정리한다.

- docs/00_context/project-definition-brief.md

필수 섹션:

- 프로젝트 목표
- 비목표
- 대상 사용자
- 핵심 사용 시나리오
- 주요 기능 범위
- 기술 방향
- 콘텐츠/데이터/API 범위
- 성공 기준
- 제약사항
- 미정 사항
- 다음 작업 후보

## 5. Harness 초기화

다음 파일을 현재 프로젝트에 맞게 갱신한다.

- harness/commands.md
- harness/verification-matrix.md
- harness/evidence-log.md

실제 실행 가능한 명령이 아직 없으면 TBD로 두고 확인 질문을 남긴다. 실행하지 않은 검증은 완료로 보고하지 않는다.

## 6. 상태 문서 갱신

초기 설정 결과를 다음 위치에 반영한다.

- docs/09_agent_state/current-status.md
- docs/09_agent_state/assumptions.md
- docs/09_agent_state/todo.md 또는 해당 템플릿의 작업 문서
- docs/09_agent_state/run-log.md

## 7. README 프로젝트화

루트 README.md는 초기화 후 템플릿 설명이 아니라 현재 프로젝트 설명이어야 한다. README를 갱신하기 전에 기존 내용을 보관한다.

1. docs/09_agent_state/archive/init/ 폴더가 있는지 확인한다.
2. 현재 README.md를 docs/09_agent_state/archive/init/original-README-{{YYYY-MM-DD}}.md로 복사해 참조용으로 보관한다. 같은 이름이 이미 있으면 덮어쓰지 말고 suffix를 붙인다.
3. project-definition-brief.md, manifest.yaml, harness/commands.md, current-status.md를 기준으로 README.md를 프로젝트 맞춤 README로 재작성한다.
4. README.md에는 최소한 프로젝트 목적, 비목표 또는 제외 범위, 대상 사용자/핵심 시나리오, 주요 기능 범위, 기술 스택, 설치/실행/검증 명령, 문서 구조, 현재 상태와 다음 작업 링크를 포함한다.
5. README.en.md가 있으면 같은 기준으로 동기화한다. 바로 갱신할 수 없으면 README.en.md 상단과 docs/09_agent_state/run-log.md에 한국어 README 기준으로 갱신 필요 상태를 명시한다.
6. README 아카이브 경로와 갱신 결과를 docs/09_agent_state/run-log.md와 init-archive-log.md에 기록한다.

## 8. 완료 조건

초기 설정은 아래 조건을 만족해야 완료로 본다.

- 프로젝트 목표와 비목표가 분리되어 있다.
- 대상 사용자와 핵심 시나리오가 있다.
- MVP 또는 첫 구현 범위가 있다.
- 기술 방향과 제약사항이 있다.
- 미정 사항과 확인 질문이 남아 있다.
- harness/commands.md와 harness/verification-matrix.md가 프로젝트 상황에 맞게 갱신되어 있다.
- 기술 스택별 Skill 후보를 검색하고 적용/제외 사유가 기록되어 있다.
- MCP 후보를 검토하고 승인/보류/거절 사유가 기록되어 있다.
- 기존 README.md가 original-README-{{YYYY-MM-DD}}.md 또는 충돌 방지 suffix 파일로 보관되어 있다.
- 루트 README.md가 현재 프로젝트 목적, 실행/검증 방법, 문서 구조를 설명한다.
- README.en.md가 동기화되었거나 갱신 필요 상태가 명시되어 있다.
- 다음 작업 후보가 기록되어 있다.

## 9. INIT 아카이브 규칙

초기 설정이 완료되면 이 문서는 더 이상 활성 프롬프트로 사용하지 않는다. Agent는 다음 순서로 아카이브한다.

1. docs/09_agent_state/archive/init/ 폴더가 있는지 확인한다.
2. 이 파일의 내용을 docs/09_agent_state/archive/init/INIT-{{YYYY-MM-DD}}.md로 옮긴다.
3. docs/09_agent_state/archive/init/init-archive-log.md에 완료일, 실행 Agent, 산출물, 남은 질문을 기록한다.
4. README 보관 파일과 README 갱신 결과가 init-archive-log.md에 포함됐는지 확인한다.
5. 루트의 INIT.md는 삭제하거나 archive 폴더로 이동한다.
6. 이후 사용자가 다시 `init`을 요청하면 archived INIT을 다시 실행하지 말고, current-status.md를 읽고 재초기화가 필요한지 먼저 확인한다.

## 10. 최종 보고 형식

- 초기 문서 확인 결과
- Stack Skill Discovery 결과
- MCP 구성 검토 결과
- 인터뷰 방식: 문서 기반 / 대화형
- 생성 또는 갱신한 문서
- README 보관 위치
- README 갱신 및 README.en.md 동기화 상태
- harness 초기화 결과
- 남은 질문
- 다음 추천 작업
- INIT 아카이브 위치
