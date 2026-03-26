# Phase 5: Notion API 실제 연동 및 비즈니스 로직 검증 -- 작업 분해

## 완료된 코드 수정 (Priority 1)

### P1-1. extractNumber() formula 타입 지원 [완료]
- **파일:** `src/lib/notion.ts` (L85-117)
- **변경:** number, formula(number), rollup(number) 3가지 타입 지원
- **검증:** 실제 Notion Items DB의 "공급가액"(formula), "부가세"(formula) 정상 파싱 확인

### P1-2. accessToken 전략 결정 [완료]
- **파일:** `src/lib/notion.ts` (L155-177, L344-369)
- **전략:** DB에 accessToken 필드 없으면 MVP 모드 (token 존재만 확인)
- **향후:** Notion DB에 `accessToken` rich_text 필드 추가 또는 HMAC 방식 전환

### P1-3. proxy.ts 토큰 검증 복원 [완료]
- **파일:** `src/proxy.ts`
- **변경:** token 파라미터 없으면 `/denied?reason=TOKEN_INVALID`로 리디렉션

### P1-4. 견적서 뷰 페이지 검증 로직 추가 [완료]
- **파일:** `src/app/invoice/[id]/page.tsx` (L61-80)
- **변경:** validateAccessToken, isInvoiceValid, draft 상태 체크 추가

### P1-5. REST API 데이터베이스 쿼리 래퍼 [완료]
- **파일:** `src/lib/notion.ts` (L260-338)
- **함수:** `queryInvoices()` -- 필터/정렬/페이지네이션 지원

---

## 실제 Notion DB 스키마 매핑 (5-1 검증 결과)

### Invoices DB (ID: 32d8d00ae1e0805a8557ddd0ace3eeb9)

| Notion 필드명 | 타입 | 코드 매핑 | 상태 |
|---|---|---|---|
| 제목 | title | (미사용 - 표시용) | OK |
| 견적서 번호 | rich_text | `invoiceNumber` | OK |
| 고객사명 | rich_text | `clientName` | OK |
| 고객 담당자명 | rich_text | `clientContact` | OK |
| 상태 | select | `status` (draft/sent/accepted) | OK |
| 발행일 | date | `issueDate` | OK |
| 만기일 | date | `dueDate` | OK |
| 항목 | relation → Items DB | `itemPageIds` | OK |
| 비고/메모 | rich_text | `note` | OK |
| accessToken | (미존재) | MVP 모드 적용 | OK |

### Items DB (Invoices의 relation 대상)

| Notion 필드명 | 타입 | 코드 매핑 | 상태 |
|---|---|---|---|
| 품명 | title | `name` (extractText) | OK |
| 수량 | number | `quantity` (extractNumber) | OK |
| 단가 | number | `unitPrice` (extractNumber) | OK |
| 공급가액 | **formula** | `supplyAmount` (extractNumber) | 수정완료 |
| 부가세 | **formula** | `taxAmount` (extractNumber) | 수정완료 |
| Invoices 1 | relation | (역참조, 코드 미사용) | OK |

---

## Phase 5 서브태스크

### Task 5-1: Notion DB 스키마 전수 점검 [완료]
- **목표:** 모든 필드명, 데이터 타입이 코드와 정확히 매핑되는지 확인
- **결과:** formula 타입 미처리, accessToken 부재 2건 발견 및 수정 완료
- **관련 파일:** `src/lib/notion.ts`, `src/types/invoice.ts`, `src/lib/schemas.ts`

### Task 5-2: 비즈니스 로직 검증 [부분 완료]
- **목표:** 금액 계산, 상태별 접근, 만기일 검증이 정확한지 확인
- **검증 항목:**
  - [x] 수량 x 단가 = 공급가액 (formula가 처리, 코드는 읽기만)
  - [x] 공급가액 x 10% = 부가세 (formula가 처리, 코드는 읽기만)
  - [x] draft 상태 견적서 비공개 (`page.tsx`에서 redirect 처리)
  - [x] 만기일 검증 (`isInvoiceValid` -- 오늘 <= 만기일)
  - [ ] **미완료:** 만기일이 지난 견적서로 테스트 (Notion DB에 테스트 데이터 추가 필요)
  - [ ] **미완료:** accepted 상태 견적서 접근 테스트
- **관련 파일:** `src/lib/notion.ts`, `src/app/invoice/[id]/page.tsx`

### Task 5-3: Playwright MCP E2E 테스트 [미시작]
- **목표:** 6가지 시나리오 자동 검증
- **선행 조건:** 개발 서버 실행 (`npm run dev`)
- **테스트 데이터 요구사항:**
  - Notion DB에 최소 3건의 견적서 (sent/draft/만료)
  - 현재 1건만 있음 (2024-001, sent, 만기 2026-03-28)
- **관련 파일:** 별도 테스트 스크립트 작성 필요

### Task 5-4: API Route Handler 검증 [미시작]
- **목표:** 응답 코드, 데이터 구조, 보안 항목 검증
- **검증 항목:**
  - [ ] GET /api/invoice/[valid-id]?token=xxx → 200 + 정상 데이터
  - [ ] GET /api/invoice/[valid-id] (token 없음) → 400
  - [ ] GET /api/invoice/[valid-id]?token=wrong → 401 (accessToken 설정 시)
  - [ ] GET /api/invoice/[invalid-id]?token=xxx → 404
  - [ ] 만기 견적서 → 410
  - [ ] accessToken이 응답 body에 포함되지 않음
  - [ ] Items relation 데이터 정상 포함
- **관련 파일:** `src/app/api/invoice/[id]/route.ts`

---

## Playwright MCP 테스트 계획 (상세 시나리오)

### 테스트 전제 조건
- 개발 서버: `http://localhost:3000`
- 테스트 Invoice ID: `32d8d00ae1e0808eb22cd8fe528b3620` (상태: sent)
- 테스트 토큰: 임의 문자열 (MVP 모드에서는 존재만 확인)

### TC-01: 정상 접근 -- 견적서 렌더링 검증
```
URL: /invoice/32d8d00ae1e0808eb22cd8fe528b3620?token=test123
기대 결과:
  - HTTP 200
  - 페이지에 "견적서 번호: 2024-001" 표시
  - "ABC 회사" 표시
  - Items 테이블에 3개 행 (웹사이트 디자인, 로고제작, 명함디자인)
  - 공급가액 합계: 5,000,000
  - 부가세 합계: 500,000
  - 총합계: 5,500,000
```

### TC-02: 잘못된 토큰 -- /denied 리디렉션
```
URL: /invoice/32d8d00ae1e0808eb22cd8fe528b3620
     (token 파라미터 없음)
기대 결과:
  - proxy.ts에서 리디렉션
  - 최종 URL: /denied?reason=TOKEN_INVALID
  - 페이지에 "유효하지 않은 링크입니다" 메시지 표시
```

### TC-03: 만료된 견적서 -- /denied 리디렉션
```
전제: Notion DB에 만기일이 과거인 견적서 추가 필요
URL: /invoice/[expired-id]?token=test123
기대 결과:
  - 최종 URL: /denied?reason=TOKEN_EXPIRED
  - 페이지에 "만기된 견적서입니다" 메시지 표시
```

### TC-04: 존재하지 않는 ID -- /denied 리디렉션
```
URL: /invoice/00000000000000000000000000000000?token=test123
기대 결과:
  - 최종 URL: /denied?reason=INVOICE_NOT_FOUND
  - 페이지에 "존재하지 않는 견적서입니다" 메시지 표시
```

### TC-05: 토큰 없음 -- 프록시에서 거부
```
URL: /invoice/32d8d00ae1e0808eb22cd8fe528b3620
기대 결과:
  - proxy.ts에서 즉시 리디렉션 (서버 컴포넌트 실행 전)
  - 최종 URL: /denied?reason=TOKEN_INVALID
```

### TC-06: PDF 다운로드 정상 작동
```
URL: /invoice/32d8d00ae1e0808eb22cd8fe528b3620?token=test123
동작:
  1. 페이지 로드 대기
  2. "PDF 다운로드" 버튼 클릭
  3. 다운로드 파일 확인
기대 결과:
  - 파일명: "견적서_2024-001_20260325.pdf"
  - 파일 크기 > 0
  - PDF 내용에 "ABC 회사", "5,500,000" 포함
```

---

## 추가 필요 테스트 데이터

현재 Notion DB에 1건만 있으므로 다음을 추가해야 합니다:

1. **만료 견적서** -- 만기일: 2025-01-01 (과거), 상태: sent
2. **draft 견적서** -- 상태: draft (기존 것을 되돌리거나 새로 추가)
3. **accepted 견적서** -- 상태: accepted, 정상 만기일

이 데이터는 Notion UI에서 수동 추가하거나, Notion API pages.create로 프로그래밍 방식 추가 가능합니다.
