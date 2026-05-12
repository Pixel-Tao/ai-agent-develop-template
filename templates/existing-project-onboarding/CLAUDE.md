# Claude Instructions

이 프로젝트의 기본 Agent 지침은 AGENTS.md를 따른다.

사용자가 `/init`, `init`, `초기화`, `프로젝트 시작`을 요청하면 루트의 INIT.md가 있는지 확인한다.

- INIT.md가 있으면 INIT.md를 읽고 그대로 실행한다.
- INIT.md가 없고 docs/09_agent_state/archive/init/에 archived INIT이 있으면 초기 설정이 완료된 것으로 보고 current-status.md를 먼저 확인한다.
- 재초기화가 필요해 보이면 사용자에게 확인한 뒤 진행한다.
