# Template Usage Guide

## 1. 준비

Node.js 18 이상을 설치한다. 이 저장소의 생성 스크립트는 별도 npm 패키지 없이 Node.js 기본 기능만 사용한다.

## 2. 템플릿 선택

`decision-guide.md`를 보고 프로젝트 상황에 맞는 템플릿을 고른다. 확신이 없으면 가장 가까운 기본 템플릿을 선택하고, 필요한 전문 폴더만 나중에 병합한다.

## 3. 프로젝트 zip 생성

대화형 실행:

```bash
node scripts/create-project.mjs
```

명령형 실행:

```bash
node scripts/create-project.mjs --template greenfield-basic --project-name my-project --owner-name "project-owner"
```

프로젝트명은 `my-project`처럼 lower-kebab-case여야 한다. 날짜는 입력하지 않는다. 스크립트가 실행일 기준으로 자동 치환한다.

## 4. 압축 해제 후 초기 문서 추가

생성된 `my-project.zip`을 대상 위치에 풀고, 사용자가 이미 가진 기획서, 메모, 요구사항 초안, 화면 스케치, 회의록, 참고 링크를 `inputs/initial-development-docs/` 또는 `inputs/references/`에 넣는다.

## 5. Agent 지침 확인

Agent는 작업 전에 다음 파일을 읽는다.

- `AGENTS.md`
- `manifest.yaml`
- `inputs/source-documents-index.md`
- `docs/09_agent_state/current-status.md`

역할 기반 템플릿은 루트 `AGENTS.md`를 Router로 보고, 실제 작업 역할에 맞는 `agents/*.md`를 추가로 읽는다.

## 6. 인터뷰로 구체화

바로 구현하지 말고 Project Discovery Interview를 먼저 실행한다. 목표, 사용자, 기능 범위, 기술 스택, 콘텐츠, 성공 기준, 제외 범위, 위험 요소를 확인해 `project-definition-brief.md` 또는 해당 템플릿의 요구사항 문서에 반영한다.

## 7. 검증

`validation-checklist.md`로 필수 파일, Agent 진입점, Skill 구조, 작업 로그 위치, assumptions 기록 위치를 확인한다. 누락된 항목이 있으면 구현 전에 먼저 보완한다.

## 기존 변수 치환 스크립트

이미 복사된 프로젝트에서 변수만 다시 치환해야 할 때는 `scripts/replace-template-variables.mjs`를 사용할 수 있다. 일반적인 새 프로젝트 생성에는 `scripts/create-project.mjs`를 권장한다.

## 8. 하네스 엔지니어링 사용

프로젝트 zip을 풀고 난 뒤 harness/README.md와 harness/harness.yaml을 확인한다. 실제 프로젝트 명령을 harness/commands.md에 정리하고, 작업 유형별 최소 검증을 harness/verification-matrix.md에 맞춘다. 작업 중 실행한 명령과 결과는 harness/evidence-log.md에 기록한다.
