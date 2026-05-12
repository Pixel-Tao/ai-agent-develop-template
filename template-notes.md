# Template Notes

## Assumptions

- 기본 담당자 값은 `{{OWNER_NAME}}` placeholder로 유지한다.
- 새 프로젝트 생성 시 날짜는 사용자가 입력하지 않고 스크립트가 실행일 기준으로 자동 치환한다.
- 문서 기본 언어는 Korean이다.
- 문서 파일은 Markdown, 메타데이터는 YAML을 사용한다.
- 파일명은 lower-kebab-case를 기준으로 한다.
- 이 저장소는 실제 제품 코드가 아니라 프로젝트 초기화를 위한 템플릿 팩이다.

## Usage Notes

일반적인 새 프로젝트 생성에는 `scripts/create-project.mjs`를 사용한다. 이미 복사된 프로젝트에서 변수만 다시 치환해야 할 때만 `scripts/replace-template-variables.mjs` 또는 `scripts/replace-template-variables.ps1`을 사용한다.

## Harness Notes

하네스 엔지니어링은 모든 템플릿에 공통 적용된다. 단, commands.md의 명령은 실제 프로젝트에 맞게 확인해야 하며, 미확정 명령은 TBD로 남겨야 한다.
