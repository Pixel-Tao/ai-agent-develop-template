# Project Init Prompt

이 문서는 생성된 프로젝트에서 초기 설정을 시작할 때 한 번만 사용하는 활성 프롬프트다. 사용자가 `init`, `/init`, `초기화`, `프로젝트 시작`을 요청하면 Agent는 이 문서를 읽고 순서대로 실행한다.

## 목적

- Agent 서비스의 목표, 사용자, tool 범위, 보안 요구, 배포 목표를 구체화한다.
- inputs/에 들어온 초기 문서가 있으면 문서 기반 인터뷰로 시작한다.
- runtime, tools, memory, evals, observability, security, deployment의 현재 구현 수준을 분리한다.
- harness/를 현재 프로젝트 명령에 맞게 초기화한다.

## 먼저 읽을 파일

1. AGENTS.md
2. manifest.yaml
3. inputs/README.md
4. inputs/source-documents-index.md
5. harness/harness.yaml
6. harness/commands.md
7. harness/verification-matrix.md
8. docs/09_agent_state/current-status.md
9. tools/tool-registry.yaml
10. security/approval-policy.md
11. skills/skills-index.yaml
12. skills/skills-sh-recommendations.yaml

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

## 2. Agent System Discovery Interview

1. Agent가 해결해야 하는 핵심 업무와 사용자 시나리오는 무엇인가?
2. Agent가 호출할 수 있는 tool과 절대 호출하면 안 되는 tool은 무엇인가?
3. high 또는 destructive action에 필요한 승인자는 누구인가?
4. run, thread, user, project memory에 각각 저장 가능한 데이터는 무엇인가?
5. 개인정보, secret, credential, source code 등 민감정보 분류 기준은 무엇인가?
6. 품질을 평가할 smoke, safety, tool-use, regression case는 무엇인가?
7. trace, log, metric, audit event를 어디에 보관하고 누가 접근하는가?
8. API server, background worker, queue, database, vector store가 필요한가?
9. local, staging, production 배포 목표와 healthcheck 기준은 무엇인가?
10. API key 없이 검증 가능한 mock provider 경로는 무엇인가?

## 3. 프로젝트 정의 산출물

인터뷰 결과를 다음 문서에 정리한다.

- docs/00_context/project-definition-brief.md

필수 섹션:

- Agent 목표와 비목표
- 대상 사용자와 주요 workflow
- tool 범위와 approval 정책
- memory와 retention 정책
- eval 기준과 threshold
- observability와 audit 요구
- deployment 목표
- 미정 사항과 다음 작업

## 4. Harness 초기화

다음 파일을 현재 프로젝트에 맞게 갱신한다.

- harness/commands.md
- harness/verification-matrix.md
- harness/evidence-log.md

실제 실행 가능한 명령이 아직 없으면 TBD로 두고 확인 질문을 남긴다. 실행하지 않은 검증은 완료로 보고하지 않는다.

## 5. 상태 문서 갱신

초기 설정 결과를 다음 위치에 반영한다.

- docs/09_agent_state/current-status.md
- docs/09_agent_state/assumptions.md
- docs/09_agent_state/run-log.md
- docs/09_agent_state/handoff-notes.md

## 6. INIT 아카이브 규칙

초기 설정이 완료되면 이 문서는 더 이상 활성 프롬프트로 사용하지 않는다.

1. docs/09_agent_state/archive/init/ 폴더가 있는지 확인한다.
2. 이 파일의 내용을 docs/09_agent_state/archive/init/INIT-{{YYYY-MM-DD}}.md로 옮긴다.
3. docs/09_agent_state/archive/init/init-archive-log.md에 완료일, 실행 Agent, 산출물, 남은 질문을 기록한다.
4. 루트의 INIT.md는 삭제하거나 archive 폴더로 이동한다.
5. 이후 사용자가 다시 `init`을 요청하면 archived INIT을 다시 실행하지 말고 current-status.md를 먼저 확인한다.

## 7. 완료 조건

초기 설정은 아래 조건을 만족해야 완료로 본다.

- Agent 목표와 비목표가 분리되어 있다.
- tool 범위와 approval 정책이 정의되어 있다.
- memory, eval, observability, deployment 방향이 정리되어 있다.
- harness/commands.md와 harness/verification-matrix.md가 프로젝트 상황에 맞게 갱신되어 있다.
- 기술 스택별 Skill 후보를 검색하고 적용/제외 사유가 기록되어 있다.
- 미정 사항과 다음 작업 후보가 기록되어 있다.

## 8. 최종 보고 형식

- 초기 문서 확인 결과
- Stack Skill Discovery 결과
- 인터뷰 방식: 문서 기반 / 대화형
- 생성 또는 갱신한 문서
- harness 초기화 결과
- 남은 질문
- 다음 추천 작업
- INIT 아카이브 위치
