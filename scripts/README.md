# Template Scripts

한국어가 기본 문서입니다. 영어판은 [README.en.md](README.en.md)를 참고하세요.

이 폴더에는 템플릿 생성과 변수 치환을 위한 스크립트가 있다. 모든 스크립트는 Node.js 또는 PowerShell 기본 기능만 사용하며, npm 패키지 설치가 필요 없다.

## 권장: 프로젝트 zip 생성

Node.js 18 이상이 필요하다.

대화형 실행:

```bash
node scripts/create-project.mjs
```

명령형 실행:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-name my-project --owner-name "project-owner"
```

프로젝트 id와 표시명을 분리할 경우 직접 지정한 project id는 `Project.Name`, `ProjectName`, `project_name`, `project-name`처럼 단일 디렉터리/zip 파일명으로 안전한 값을 사용할 수 있다.

```bash
node scripts/create-project.mjs --template greenfield-basic --project-id Project.Name --project-name "TAO CRM" --owner-name TAO
```

동작:

1. 템플릿을 선택한다.
2. 프로젝트명이 파일명/경로에 안전한지 검증한다.
3. 오너명을 입력받는다.
4. 날짜는 실행일 기준으로 자동 설정한다.
5. 템플릿을 복사하고 변수를 치환한다.
6. 프로젝트 파일을 zip 최상위에 넣어 저장소 루트에 `my-project.zip`을 만든다.

기존 zip을 덮어써야 하면 `--force`를 붙인다.

## 템플릿 목록 확인

```bash
node scripts/create-project.mjs --list
```

`--list`는 템플릿 ID와 간략한 용도 설명을 함께 출력한다.

`production-agent-system` 생성 결과 회귀 테스트를 실행한다.

```bash
npm run test:generator
```

모든 템플릿 생성 smoke test와 delivery package test:

```bash
npm run test:generator:all
npm run test:delivery
npm run test:skills
```

## skills.sh 연동

생성된 프로젝트에서는 `skills/skills-sh-recommendations.yaml`을 참고해 기술 스택을 감지하고, `https://www.skills.sh/`에서 필요한 stack-specific Skill을 검색한 뒤 검토 후 `skills` CLI로 설치한다.

```bash
npx skills add <owner/repo>
DISABLE_TELEMETRY=1 npx skills add <owner/repo>
```

설치한 Skill과 제외한 후보는 `skills/selected-skills.md`와 `docs/09_agent_state/run-log.md`에 기록한다.

## Delivery Sanitization

납품 전 Agent 운영자료를 제외한 clean package를 생성한다.

```bash
node scripts/archive-agent-workspace.mjs --policy delivery/sanitize-policy.yaml --output dist/internal-archive
node scripts/create-delivery-package.mjs --policy delivery/sanitize-policy.yaml --output dist/delivery
node scripts/validate-delivery-clean.mjs --package dist/delivery/project-delivery.zip --policy delivery/sanitize-policy.yaml
```

기존 프로젝트에 템플릿을 안전하게 적용할 때:

```bash
node scripts/apply-template.mjs --template existing-project-onboarding --target ../existing-project --dry-run
```

## 변수만 치환

이미 복사된 프로젝트에서 변수 치환만 다시 실행해야 할 때 사용한다.

```bash
node scripts/replace-template-variables.mjs --root . --variables-file scripts/template-variables.example.yaml
node scripts/replace-template-variables.mjs --root . --variables-file scripts/template-variables.example.yaml --apply
```

Windows PowerShell만 사용할 경우:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/replace-template-variables.ps1 -RootPath . -VariablesFile scripts/template-variables.example.yaml
```

## 변수 파일 형식

`scripts/template-variables.example.yaml`은 flat YAML 형식만 지원한다.

```yaml
PROJECT_ID: my-project
PROJECT_NAME: my-project
PROJECT_STATUS: planning
OWNER_NAME: "{{OWNER_NAME}}"
YYYY-MM-DD: 2026-05-12
```
