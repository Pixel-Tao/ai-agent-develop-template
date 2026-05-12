# AI Data Project

## 목적

AI, 데이터, LLM, 모델 평가 프로젝트를 위한 구조. 이 템플릿은 실제 프로젝트에 복사한 뒤 프로젝트 상황에 맞게 변수와 문서를 채워 사용하는 구조다. Agent가 처음 읽을 진입점과 사람이 검토할 설명 문서를 분리해 초기 온보딩 비용을 줄인다.

## 언제 사용해야 하는가

- LLM/RAG 프로젝트
- 모델 평가
- 데이터 파이프라인과 실험 관리

## 언제 사용하지 말아야 하는가

- 일반 CRUD 앱
- 데이터와 평가가 핵심이 아닌 프로젝트

## 초기화 순서

1. manifest.yaml의 프로젝트 메타데이터를 채운다.
2. AGENTS.md 또는 역할별 Agent 문서를 확인한다.
3. docs/09_agent_state/current-status.md에 현재 상태를 기록한다.
4. 필요한 Skill을 skills/skills-index.yaml에서 선택한다.
5. backlog, work allocation, 또는 템플릿별 작업 문서에 초기 작업을 등록한다.

## 필수 파일

- README.md
- AGENTS.md
- manifest.yaml
- template.yaml
- validation-checklist.md
- docs/09_agent_state/current-status.md

## 선택 파일

템플릿별 도메인 문서와 outputs 하위 산출물은 프로젝트 필요에 따라 확장한다. 빈 폴더는 .gitkeep으로 유지할 수 있다.

## 품질 게이트

- Agent가 처음 읽을 파일이 명확하다.
- 작업 로그, assumptions, known issues 위치가 있다.
- 템플릿별 필수 문서가 존재한다.
- 위험 변경의 승인 조건이 문서화되어 있다.
- 검증 체크리스트가 완료되어 있다.

## Init 시작

프로젝트를 처음 시작할 때 Agent에게 `init` 또는 `/init`을 요청한다. Agent는 INIT.md를 읽고 inputs/ 문서 확인, Project Discovery Interview, harness 초기화를 수행한다. 초기 설정이 끝나면 INIT.md는 docs/09_agent_state/archive/init/로 이동되어 다시 자동 실행되지 않는다.
