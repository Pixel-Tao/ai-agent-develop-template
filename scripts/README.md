# Template Variable Replacement Scripts

이 폴더에는 템플릿의 VARIABLE placeholder를 실제 프로젝트 값으로 치환하는 스크립트가 있다.

## 권장: Node.js 스크립트

macOS, Linux, Windows에서 동일하게 실행하려면 Node.js 스크립트를 사용한다. 외부 npm 패키지는 필요하지 않다.

```sh
node scripts/replace-template-variables.mjs \
  --root . \
  --variables-file scripts/template-variables.example.yaml
```

기본 동작은 Dry Run이다. 실제 파일에 적용하려면 `--apply`를 붙인다.

```sh
node scripts/replace-template-variables.mjs \
  --root . \
  --variables-file ./my-project.variables.yaml \
  --apply
```

CLI에서 값을 직접 넘길 수도 있다.

```sh
node scripts/replace-template-variables.mjs \
  --root . \
  --set PROJECT_NAME="My Project" \
  --set PROJECT_STATUS=active \
  --apply
```

## Windows PowerShell 스크립트

Windows PowerShell 환경에서는 기존 PowerShell 스크립트도 사용할 수 있다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/replace-template-variables.ps1 `
  -RootPath . `
  -VariablesFile scripts/template-variables.example.yaml
```

실제 적용은 `-Apply`를 붙인다.

## 변수 파일 형식

변수 파일은 flat YAML 형식만 지원한다.

```yaml
PROJECT_ID: my-project
PROJECT_NAME: My Project
PROJECT_STATUS: planning
OWNER_NAME: TAO
YYYY-MM-DD: 2026-05-12
```

## 안전 옵션

- `--backup` 또는 `-Backup`: 치환 전 `.bak` 파일 생성
- `--fail-on-unresolved` 또는 `-FailOnUnresolved`: 남은 placeholder가 있으면 실패
- `--include`: 치환 대상 파일 패턴 추가
- `--exclude-dir`: 제외할 디렉터리 추가
