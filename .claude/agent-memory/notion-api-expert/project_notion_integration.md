---
name: Notion API 통합 프로젝트 현황
description: invoice-web 프로젝트의 Notion DB 스키마 매핑, 코드 수정 이력, Phase 5 진행 상태
type: project
---

## 현황 (2026-03-26 업데이트)
Phase 5 코드 수정 완료. E2E 테스트 및 추가 테스트 데이터 생성 단계.

**Why:** Notion API 실제 연동에서 발견된 critical issues 수정 및 비즈니스 로직 검증
**How to apply:** 향후 DB 스키마 변경이나 필드 추가 시 이 매핑을 참조

## Notion DB 스키마 (실제 확인 완료)

### Invoices DB (ID: 32d8d00ae1e0805a8557ddd0ace3eeb9)
- 제목: title (표시용)
- 견적서 번호: rich_text → invoiceNumber
- 고객사명: rich_text → clientName
- 고객 담당자명: rich_text → clientContact
- 상태: select (draft/sent/accepted) → status
- 발행일: date → issueDate
- 만기일: date → dueDate
- 항목: relation → Items DB
- 비고/메모: rich_text → note
- accessToken: 미존재 (MVP 모드 적용)

### Items DB (relation 대상)
- 품명: title → name
- 수량: number → quantity
- 단가: number → unitPrice
- 공급가액: **formula** → supplyAmount (extractNumber가 formula 지원)
- 부가세: **formula** → taxAmount (extractNumber가 formula 지원)

## 해결된 Critical Issues
1. extractNumber()가 formula 타입 미지원 → number/formula/rollup 3가지 지원으로 수정
2. accessToken 필드 부재 → MVP 모드 (token 존재만 확인) + 향후 확장 가능 구조
3. proxy.ts 토큰 검증 비활성 → 복원 완료
4. page.tsx 검증 로직 부재 → validateAccessToken + isInvoiceValid + draft 체크 추가

## @notionhq/client v5.14.0 주의사항
- databases.query 메서드가 제거됨
- DB 쿼리는 REST API 직접 호출 필요 (fetch)

## 테스트 데이터
- 견적서 2024-001: ID 32d8d00ae1e0808eb22cd8fe528b3620, 상태 sent, 만기 2026-03-28
- Items 3건: 웹사이트 디자인(3M), 로고제작(1M), 명함디자인(1M) = 합계 5.5M
