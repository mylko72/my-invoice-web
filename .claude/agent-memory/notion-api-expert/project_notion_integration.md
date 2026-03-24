---
name: Notion API 통합 프로젝트 현황
description: invoice-web 프로젝트에서 Notion API 통합을 위한 분석 및 설계 현황
type: project
---

## 현황
Notion API 통합을 위한 초기 분석 및 가이드 작성 단계 (2026-03-16)

**Why:** 인보이스 웹 앱에 Notion 데이터베이스 연동을 위해 전체 통합 방법론 분석 요청

**How to apply:** 향후 실제 통합 작업 시 이 분석을 기반으로 구현 진행

## 권장 디렉터리 구조 (향후 구현 시 참고)
```
src/
├── lib/
│   └── notion.ts          # Notion 클라이언트 초기화
├── types/
│   └── notion.ts          # Notion 관련 TypeScript 타입
├── services/
│   └── notion/
│       ├── database.ts    # 데이터베이스 CRUD 서비스
│       └── helpers.ts     # 응답 파싱 헬퍼
└── app/
    └── api/
        └── notion/        # Next.js API Route 핸들러
```

## 필요 패키지
- @notionhq/client — 공식 Notion API 클라이언트
- .env.local에 NOTION_API_KEY, NOTION_DATABASE_ID 저장 필요
