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

이 템플릿은 역할이 분리된 대규모 협업 프로젝트에 사용한다. 인터뷰는 기능 자체만이 아니라 의사결정권, 역할별 책임, 승인 흐름, 인수인계 기준을 먼저 고정한다. 답변은 RACI, ownership map, workflow, work allocation에 연결해야 한다.

1. 이번 프로젝트의 목표와 성공 기준을 최종 승인하는 사람은 누구인가?
2. PM, Tech Lead, Frontend, Backend, QA, DevOps, Security 등 어떤 역할이 필요한가?
3. 각 역할의 책임 범위와 결정권은 어디까지인가?
4. 요구사항 변경, API 변경, DB 변경, 보안 변경, 릴리즈 승인은 누가 승인해야 하는가?
5. 현재 가장 큰 역할 간 의존성이나 병목은 무엇인가?
6. 작업 접수, 할당, 구현, 리뷰, QA, 릴리즈, 핸드오프는 어떤 순서로 진행해야 하는가?
7. 어떤 문서나 산출물이 없으면 다음 역할이 작업을 시작하면 안 되는가?
8. 커뮤니케이션 채널, 회의 주기, 에스컬레이션 기준은 무엇인가?
9. 품질 게이트와 릴리즈 준비 완료 기준은 무엇인가?
10. 첫 번째 스프린트 또는 초기 work allocation에 넣을 작업은 무엇인가?

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

## 7. 완료 조건

초기 설정은 아래 조건을 만족해야 완료로 본다.

- 프로젝트 목표와 비목표가 분리되어 있다.
- 대상 사용자와 핵심 시나리오가 있다.
- MVP 또는 첫 구현 범위가 있다.
- 기술 방향과 제약사항이 있다.
- 미정 사항과 확인 질문이 남아 있다.
- harness/commands.md와 harness/verification-matrix.md가 프로젝트 상황에 맞게 갱신되어 있다.
- 기술 스택별 Skill 후보를 검색하고 적용/제외 사유가 기록되어 있다.
- 다음 작업 후보가 기록되어 있다.

## 8. INIT 아카이브 규칙

초기 설정이 완료되면 이 문서는 더 이상 활성 프롬프트로 사용하지 않는다. Agent는 다음 순서로 아카이브한다.

1. docs/09_agent_state/archive/init/ 폴더가 있는지 확인한다.
2. 이 파일의 내용을 docs/09_agent_state/archive/init/INIT-{{YYYY-MM-DD}}.md로 옮긴다.
3. docs/09_agent_state/archive/init/init-archive-log.md에 완료일, 실행 Agent, 산출물, 남은 질문을 기록한다.
4. 루트의 INIT.md는 삭제하거나 archive 폴더로 이동한다.
5. 이후 사용자가 다시 `init`을 요청하면 archived INIT을 다시 실행하지 말고, current-status.md를 읽고 재초기화가 필요한지 먼저 확인한다.

## 9. 최종 보고 형식

- 초기 문서 확인 결과
- Stack Skill Discovery 결과
- 인터뷰 방식: 문서 기반 / 대화형
- 생성 또는 갱신한 문서
- harness 초기화 결과
- 남은 질문
- 다음 추천 작업
- INIT 아카이브 위치
