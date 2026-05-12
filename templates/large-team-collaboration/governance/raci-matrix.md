# RACI Matrix

작업 영역별 Responsible, Accountable, Consulted, Informed 역할을 정의한다. 역할 충돌이 생기면 이 문서를 기준으로 소유권과 승인자를 확인한다.

## 사용 방법

이 문서는 프로젝트 초기화 시 초안을 작성하고 작업 진행에 따라 갱신한다. AI Agent는 작업 전에 이 문서의 현재 상태를 확인하고, 불확실한 내용은 단정하지 않고 assumptions 또는 unknowns에 기록한다.

| 작업 영역 | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| 요구사항 변경 | product-manager-agent | product-manager-agent | tech-lead-agent, qa-agent | 전체 팀 |
| API 스펙 변경 | backend-agent | tech-lead-agent | frontend-agent, qa-agent, security-agent | PM |
| DB 스키마 변경 | database-agent | tech-lead-agent | backend-agent, devops-agent | QA |
| 인증/인가 변경 | security-agent | tech-lead-agent | backend-agent, qa-agent | PM, DevOps |
| 릴리즈 승인 | devops-agent | tech-lead-agent | qa-agent, security-agent | 전체 팀 |
| 장애 대응 | devops-agent | tech-lead-agent | backend-agent, qa-agent | PM |
| 보안 이슈 대응 | security-agent | security-agent | backend-agent, devops-agent | Tech Lead, PM |
| 테스트 전략 변경 | qa-agent | qa-agent | tech-lead-agent, frontend-agent, backend-agent | 전체 팀 |
