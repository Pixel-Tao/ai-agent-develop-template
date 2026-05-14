# Template Scripts

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

Run the production-agent-system generator regression test:

```bash
npm run test:generator
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
