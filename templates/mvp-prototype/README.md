# MVP Prototype

## 목적

아이디어 검증과 빠른 프로토타입 개발을 위한 경량 구조. 이 템플릿은 실제 프로젝트에 복사한 뒤 프로젝트 상황에 맞게 변수와 문서를 채워 사용하는 구조다. Agent가 처음 읽을 진입점과 사람이 검토할 설명 문서를 분리해 초기 온보딩 비용을 줄인다.

## 언제 사용해야 하는가

- 빠른 검증
- 짧은 실험 주기
- 범위가 작은 MVP

## 언제 사용하지 말아야 하는가

- 규제 프로젝트
- 대규모 장기 운영 프로젝트

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
