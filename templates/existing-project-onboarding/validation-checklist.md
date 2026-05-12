# Validation Checklist

## 기본 파일

- [ ] README.md 존재
- [ ] AGENTS.md 존재
- [ ] manifest.yaml 존재
- [ ] template.yaml 존재

## 문서 구조

- [ ] docs 폴더 존재
- [ ] Agent 상태 문서 존재
- [ ] 작업 관리 문서 존재
- [ ] 의사결정 로그 존재

## Skill 구조

- [ ] skills 폴더 존재
- [ ] skills-index.yaml 존재
- [ ] 필요한 Skill의 SKILL.md 존재

## Agent 작업성

- [ ] Agent가 처음 읽을 파일이 명시되어 있음
- [ ] 작업 로그 위치가 명시되어 있음
- [ ] assumptions 기록 위치가 명시되어 있음
- [ ] 완료 보고 형식이 있음

## 템플릿별 특수 검증

- [ ] 문서가 부족한 기존 프로젝트 분석에 필요한 필수 문서가 있음
- [ ] known issues 위치가 명시되어 있음
- [ ] 품질 게이트와 승인 조건이 문서화되어 있음

## 프로젝트 발견 인터뷰 검증

- [ ] project-discovery-interview.md 존재
- [ ] Project Discovery Interview Skill 존재
- [ ] 프로젝트 목표와 이번 버전 목표가 분리되어 있음
- [ ] 대상 사용자와 사용 상황이 구체화되어 있음
- [ ] 핵심 콘텐츠 또는 데이터가 정의되어 있음
- [ ] 필수 범위, 다음 버전 범위, 제외 범위가 분리되어 있음
- [ ] 성공 기준과 검증 방법이 기록되어 있음
- [ ] 결정, 가정, 미정이 분리되어 있음

## 초기 개발 문서 입력 검증

- [ ] inputs/README.md 존재
- [ ] inputs/source-documents-index.md 존재
- [ ] inputs/initial-development-docs/ 존재
- [ ] inputs/references/ 존재
- [ ] 초기 문서가 있으면 source-documents-index.md에 등록되어 있음
- [ ] 초기 문서에서 도출한 질문이 Project Discovery Interview에 반영되어 있음
- [ ] 원본 문서 내용과 사용자 확인 결과의 충돌 여부가 기록되어 있음

## 하네스 엔지니어링 검증

- [ ] harness/README.md 존재
- [ ] harness/harness.yaml 존재
- [ ] harness/commands.md 존재
- [ ] harness/verification-matrix.md 존재
- [ ] harness/evidence-log.md 존재
- [ ] harness-engineering Skill 존재
- [ ] 실행 명령, 검증 기준, 증거 위치가 문서화되어 있음
- [ ] 실행하지 못한 검증의 사유와 대체 계획이 기록되어 있음
