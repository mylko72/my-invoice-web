# Invoice Web MVP 개발 로드맵

> 작성일: 2026-03-23
> 기준 브랜치: `main`
> 기술 스택: Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4 · shadcn/ui · Zod · @notionhq/client · @react-pdf/renderer

---

## 프로젝트 개요

Notion 데이터베이스에서 관리하는 견적서를 B2B 클라이언트 담당자가 공유 링크로 조회하고 PDF로 다운로드하는 서비스입니다.

**핵심 사용자 여정:**
```
담당자 → /invoice/[id]?token=[accessToken]
          ↓ proxy.ts  : token 파라미터 존재 여부 1차 확인
          ↓ page.tsx  : getInvoice(id) Notion API 조회 (60초 캐시)
          ↓ 서버 컴포넌트: validateAccessToken() + isInvoiceValid() 2차 검증
          ↓ 견적서 UI 렌더링
          ↓ PDF 다운로드 또는 인쇄
```

**기능 ID 목록:**

| ID   | 기능명                          | 우선순위 |
|------|---------------------------------|----------|
| F001 | 프로젝트 골격 구축               | 필수     |
| F002 | 공통 모듈 / 유틸리티             | 필수     |
| F003 | Notion API 연동 (실제 DB 매핑)  | 필수     |
| F004 | 견적서 뷰 UI 완성               | 필수     |
| F005 | 토큰 기반 접근 제어              | 필수     |
| F006 | PDF 다운로드                    | 필수     |
| F007 | 최적화 및 Vercel 배포           | 필수     |

---

## Phase 1: 프로젝트 초기 설정(골격 구축) — 완료

**[F001] 관련 기능**

### 진행 순서 및 근거

프레임워크 설치, 환경변수 템플릿, 디렉터리 구조, 타입 정의, 기본 라우팅을 먼저 확립해야 이후 모든 Phase의 코드가 올바른 경로와 타입 기반 위에서 작성됩니다. 데이터 흐름의 뼈대 없이 UI나 API를 먼저 구현하면 대규모 리팩토링이 발생합니다.

### 작업 항목 (완료됨)

- [x] **패키지 설치** — `@notionhq/client`, `zod`, `@react-pdf/renderer`, `next-themes`, `sonner`, `lucide-react`
- [x] **타입 정의** (`src/types/invoice.ts`)
  - `Invoice`, `InvoiceItem`, `InvoiceSummary` 인터페이스
  - `InvoiceStatus`, `InvoiceErrorCode` 유니온 타입
  - `InvoiceApiResponse` (Success / Error 유니온)
- [x] **Zod 스키마** (`src/lib/schemas.ts`)
  - `invoiceItemSchema`, `invoiceSchema`, `invoiceStatusSchema`
  - `validateInvoice()` safeParse 래퍼 함수
- [x] **Notion API 클라이언트 + 캐싱** (`src/lib/notion.ts`)
  - `getInvoice()` — `unstable_cache` 60초 캐시 적용
  - `validateAccessToken()`, `isInvoiceValid()` 검증 함수
  - `extractText()`, `extractDate()`, `extractSelect()`, `extractNumber()` 파싱 헬퍼
  - `parseInvoiceItems()` — JSON 문자열 → `InvoiceItem[]` 변환
- [x] **API Route Handler** (`src/app/api/invoice/[id]/route.ts`)
  - `GET /api/invoice/[id]?token=` 엔드포인트
  - 응답 코드: 200 / 400 / 401 / 404 / 410 / 500
  - 응답에서 `accessToken` 필드 제거 (클라이언트 노출 방지)
- [x] **Proxy 접근 제어** (`src/proxy.ts`)
  - `/invoice/:path*` 경로에서 `token` 파라미터 존재 여부 1차 확인
  - 미존재 시 `/denied?reason=TOKEN_INVALID` 리디렉션
- [x] **견적서 뷰 페이지 기본 구조** (`src/app/invoice/[id]/page.tsx`)
  - `generateMetadata()` 동적 메타데이터 (noindex 포함)
  - 서버 컴포넌트에서 2차 토큰·만기일 검증
  - 임시 인라인 UI (Phase 2에서 컴포넌트로 분리 예정)
- [x] **접근 거부 페이지** (`src/app/denied/page.tsx`)
  - `InvoiceErrorCode` 별 메시지 분기 (`TOKEN_INVALID`, `TOKEN_EXPIRED`, `INVOICE_NOT_FOUND`, `SERVER_ERROR`)
  - 담당자 이메일 링크 (`CONTACT_EMAIL` 환경변수)
- [x] **포맷 유틸리티** (`src/utils/format.ts`)
  - `formatDate()`, `formatDateShort()`, `formatAmount()`, `formatCurrency()`
  - `generatePdfFileName()` — `견적서_[번호]_[발행일].pdf`
  - `formatInvoiceStatus()`, `copyToClipboard()`
- [x] **환경변수 템플릿** (`.env.example`)

### 완료 기준

- [x] `npm run dev` 정상 실행
- [x] `npm run build` 타입 오류 없이 통과
- [x] `/invoice/test-id` 접근 시 `/denied?reason=TOKEN_INVALID`으로 리디렉션 확인
- [x] TypeScript 컴파일 오류 0개

---

## Phase 2: 공통 모듈/컴포넌트 개발

**[F002] 관련 기능**

### 진행 순서 및 근거

견적서 UI(Phase 3)와 PDF(Phase 4) 모두 동일한 레이아웃 컴포넌트와 유틸리티를 공유합니다. 공통 컴포넌트를 먼저 확립하면 Phase 3~4에서 중복 코드 없이 재사용할 수 있으며, 디자인 일관성도 보장됩니다. Phase 1이 완료된 후 Phase 3와 **병렬 진행 가능**합니다(의존성 없음).

### 작업 항목

#### 2-1. 공통 레이아웃 컴포넌트 정비

- [ ] **`NavBar` 정비** (`src/components/layout/NavBar.tsx`)
  - 견적서 뷰 페이지에서는 `print:hidden` 클래스 적용
  - 서비스 로고 / 이름 표시
- [ ] **`Footer` 정비** (`src/components/layout/Footer.tsx`)
  - 서비스명, 저작권 텍스트
  - `print:hidden` 적용

#### 2-2. 견적서 전용 UI 컴포넌트 스캐폴딩

각 컴포넌트는 `src/components/invoice/` 디렉터리에 생성합니다.

```
src/components/invoice/
├── InvoiceHeader.tsx        # 회사 정보, 견적서 번호, 발행일/만기일
├── InvoiceClientInfo.tsx    # 고객사명, 담당자
├── InvoiceItemsTable.tsx    # 품목 테이블
├── InvoiceSummary.tsx       # 합계 섹션 (공급가액 / 부가세 / 총액)
├── InvoiceNote.tsx          # 비고
└── InvoiceActions.tsx       # PDF 다운로드 / 인쇄 버튼 (print:hidden)
```

**컴포넌트별 Props 인터페이스:**

```typescript
// InvoiceHeader
interface InvoiceHeaderProps {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  companyName?: string; // NEXT_PUBLIC_COMPANY_NAME 환경변수
}

// InvoiceClientInfo
interface InvoiceClientInfoProps {
  clientName: string;
  clientContact?: string;
}

// InvoiceItemsTable
interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}

// InvoiceSummary
interface InvoiceSummaryProps {
  summary: InvoiceSummary; // totalSupply / totalTax / grandTotal
}

// InvoiceNote
interface InvoiceNoteProps {
  note: string;
}

// InvoiceActions (클라이언트 컴포넌트 — "use client")
interface InvoiceActionsProps {
  invoiceNumber: string;
  issueDate: string;
  invoiceData: Invoice; // PDF 생성용
}
```

#### 2-3. 상태 뱃지 컴포넌트

- [ ] **`InvoiceStatusBadge`** (`src/components/invoice/InvoiceStatusBadge.tsx`)
  - `draft` → 회색, `sent` → 파란색, `accepted` → 초록색
  - Tailwind CSS 색상 변수 활용

#### 2-4. 로딩 스켈레톤

- [ ] **`src/app/invoice/[id]/loading.tsx`** 구현
  - A4 비율 카드 스켈레톤 (`animate-pulse`)
  - 헤더, 테이블, 합계 섹션 형태 반영

### 완료 기준

- [ ] `src/components/invoice/` 하위 6개 컴포넌트 파일 생성
- [ ] 각 컴포넌트가 Props 인터페이스 기반으로 TypeScript 오류 없이 렌더링
- [ ] `npm run lint` 통과
- [ ] 스켈레톤 UI가 실제 견적서 레이아웃과 동일한 형태로 표시

---

## Phase 3: 핵심 기능 개발 — 견적서 뷰 UI

**[F004] [F005] 관련 기능**

### 진행 순서 및 근거

Phase 2에서 만든 컴포넌트를 조합해 실제 견적서 화면을 구성합니다. 이 단계는 서비스의 유일한 핵심 화면이므로, PDF 생성(Phase 4)보다 먼저 완성해야 합니다. PDF 렌더러는 완성된 데이터 구조를 기반으로 작동하기 때문입니다. Phase 2와 **병렬 진행 가능**합니다.

### 작업 항목

#### 3-1. 견적서 뷰 페이지 UI 완성

파일: `src/app/invoice/[id]/page.tsx`

```typescript
// 서버 컴포넌트에서 계산 후 자식 컴포넌트로 전달
const totalSupply = invoice.items.reduce((sum, item) => sum + item.supplyAmount, 0);
const totalTax    = invoice.items.reduce((sum, item) => sum + item.taxAmount, 0);
const grandTotal  = totalSupply + totalTax;

const summary: InvoiceSummary = { totalSupply, totalTax, grandTotal };
```

- [ ] `InvoiceHeader` 컴포넌트 통합
- [ ] `InvoiceClientInfo` 컴포넌트 통합
- [ ] `InvoiceItemsTable` 컴포넌트 통합
- [ ] `InvoiceSummary` 컴포넌트 통합
- [ ] `InvoiceNote` 컴포넌트 통합 (note가 빈 문자열이면 렌더링 생략)
- [ ] `InvoiceActions` 컴포넌트 통합 (클라이언트 컴포넌트)
- [ ] 페이지 최외곽 레이아웃: A4 비율 카드 (`max-w-4xl mx-auto`)
- [ ] 임시 인라인 UI 코드 제거

#### 3-2. 반응형 레이아웃 적용

```
모바일 (< 640px) : 단일 컬럼, 폰트 크기 축소, 테이블 가로 스크롤
태블릿 (640~1024px): 여백 확대, 버튼 크기 조정
데스크톱 (> 1024px): A4 비율 카드 중앙 정렬
```

- [ ] `InvoiceItemsTable` 모바일 가로 스크롤 처리 (`overflow-x-auto`)
- [ ] `InvoiceHeader` 모바일 세로 스택 레이아웃
- [ ] 버튼 영역 모바일 전체 너비 (`w-full sm:w-auto`)

#### 3-3. 인쇄 CSS 적용

- [ ] `InvoiceActions` — `print:hidden`으로 액션 버튼 숨김
- [ ] `NavBar`, `Footer` — `print:hidden`
- [ ] 인쇄 시 페이지 여백 제거: `print:p-0 print:m-0`
- [ ] 견적서 카드 인쇄 시 그림자 제거: `print:shadow-none`
- [ ] `@page` CSS 규칙 (`globals.css`에 추가):
  ```css
  @media print {
    @page {
      margin: 15mm;
      size: A4;
    }
  }
  ```

#### 3-4. 접근 거부 페이지 UX 개선

파일: `src/app/denied/page.tsx`

- [ ] `reason` 없이 직접 `/denied` 접근 시 기본 메시지 표시 (이미 구현됨, 시각적 검수)
- [ ] 오류 코드별 아이콘 차별화 (현재 `AlertCircle` 단일 → 코드별 분기)
- [ ] 재시도 안내 문구 추가 (`SERVER_ERROR` 케이스)
- [ ] 모바일 레이아웃 검수

### 완료 기준

- [ ] `/invoice/[id]?token=[valid]` 접속 시 견적서 전체 UI가 정상 렌더링
- [ ] 품목이 0개인 경우 "견적 항목이 없습니다" 빈 상태 표시
- [ ] 모바일(375px), 태블릿(768px), 데스크톱(1440px) 3개 뷰포트 시각 검수 통과
- [ ] 브라우저 인쇄 미리보기에서 A4 페이지 1장 내 렌더링 확인
- [ ] `npm run lint` 통과

---

## Phase 4: 추가 기능 개발 — PDF 다운로드

**[F006] 관련 기능**

### 진행 순서 및 근거

PDF 생성은 완성된 견적서 데이터 구조와 UI 확정 이후에 진행해야 합니다. 데이터 모델이 안정되지 않은 상태에서 PDF 레이아웃을 구축하면 반복 수정이 발생합니다. Phase 3 완료 후 진행합니다.

### 작업 항목

#### 4-1. PdfDownloadButton 클라이언트 컴포넌트 구현

파일: `src/components/invoice/PdfDownloadButton.tsx`

```typescript
"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { generatePdfFileName } from "@/utils/format";
import type { Invoice } from "@/types/invoice";

interface PdfDownloadButtonProps {
  invoice: Invoice;
}

export function PdfDownloadButton({ invoice }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Phase 4-2에서 구현한 PDF 생성 로직 호출
      const { generateInvoicePdf } = await import("@/lib/pdf");
      await generateInvoicePdf(invoice);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
    >
      <Download className="w-4 h-4" />
      {isGenerating ? "생성 중..." : "PDF 다운로드"}
    </button>
  );
}
```

#### 4-2. @react-pdf/renderer PDF 생성 모듈

파일: `src/lib/pdf.tsx`

```typescript
// @react-pdf/renderer 기반 견적서 PDF 문서 컴포넌트
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { formatAmount, formatDate, generatePdfFileName } from "@/utils/format";
import type { Invoice, InvoiceSummary } from "@/types/invoice";
```

- [ ] `InvoicePdfDocument` 컴포넌트 (서버/클라이언트 공용 React 컴포넌트)
  - `InvoicePdfHeader` — 회사명, 견적서 번호, 발행일/만기일
  - `InvoicePdfClientInfo` — 고객사명, 담당자
  - `InvoicePdfItemsTable` — 품목 테이블 (헤더 + 행)
  - `InvoicePdfSummary` — 공급가액 / 부가세 / 합계
  - `InvoicePdfNote` — 비고 (값 있을 때만)
- [ ] `generateInvoicePdf(invoice: Invoice)` — Blob 생성 후 `URL.createObjectURL` 다운로드 트리거
- [ ] 파일명: `generatePdfFileName(invoice.invoiceNumber, invoice.issueDate)` 사용

**PDF 스타일 가이드:**
```typescript
const styles = StyleSheet.create({
  page:        { padding: 40, fontFamily: "Helvetica" },
  title:       { fontSize: 22, fontWeight: "bold", textAlign: "right" },
  tableHeader: { backgroundColor: "#f9fafb", fontWeight: "bold" },
  totalRow:    { borderTop: "1pt solid #374151", fontWeight: "bold" },
});
```

> 한글 폰트가 필요한 경우 `Font.register()`로 NanumGothic 등록 필요.
> `@react-pdf/renderer`는 브라우저 번들 크기가 크므로 `dynamic import` 필수.

#### 4-3. InvoiceActions 컴포넌트 업데이트

파일: `src/components/invoice/InvoiceActions.tsx`

- [ ] 기존 `window.print()` 호출 버튼 → `PdfDownloadButton` 컴포넌트로 교체
- [ ] 인쇄 버튼은 `window.print()` 유지 (별도 유지)
- [ ] Sonner 토스트로 다운로드 완료/실패 알림 추가

```typescript
import { toast } from "sonner";

// 성공 시
toast.success("PDF가 다운로드되었습니다.");

// 실패 시
toast.error("PDF 생성에 실패했습니다. 다시 시도해 주세요.");
```

#### 4-4. 대안 방안 (html2canvas + jsPDF)

`@react-pdf/renderer`에서 한글 폰트 이슈가 발생하는 경우:

```typescript
// src/lib/pdf-canvas.ts (대안)
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePdfFromDom(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element!, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
  pdf.save(fileName);
}
```

> `html2canvas` 방식은 한글 깨짐 없이 현재 렌더링된 DOM을 그대로 캡처합니다.
> 단, 품목이 많아 페이지가 넘어가는 경우 멀티 페이지 처리 로직 추가 필요.

### 완료 기준

- [ ] PDF 다운로드 버튼 클릭 시 `견적서_[번호]_[발행일].pdf` 파일 자동 다운로드
- [ ] PDF 내 한글 깨짐 없음
- [ ] 빈 항목 목록 케이스에서도 PDF 정상 생성
- [ ] 다운로드 중 버튼 비활성화 및 "생성 중..." 텍스트 표시
- [ ] 성공/실패 토스트 알림 정상 동작
- [ ] `npm run build` 타입 오류 없이 통과

---

## Phase 5: API 연동 및 비즈니스 로직 구현

**[F003] [F005] 관련 기능**

> **Playwright MCP 테스트 필수** — 이 Phase에서 실제 Notion API 연동, 토큰 검증, 만기일 처리 등 모든 비즈니스 로직을 실제 환경에서 검증합니다.

### 진행 순서 및 근거

Phase 1~4의 코드가 실제 Notion 데이터베이스와 올바르게 연동되는지 검증합니다. 실제 API 연동 테스트는 UI와 PDF가 완성된 후에 진행해야 전체 사용자 여정을 한 번에 검증할 수 있습니다.

### 작업 항목

#### 5-1. Notion 데이터베이스 필드 매핑 확인

파일: `src/lib/notion.ts` — `parseNotionPage()` 함수

현재 코드의 필드명과 실제 Notion DB의 속성명이 일치하는지 확인합니다.

```typescript
// 현재 코드의 필드명 (실제 DB 속성명으로 교체 필요)
invoiceNumber : extractText(props["Name"])       // Notion DB의 Title 속성명
clientName    : extractText(props["고객사명"])
clientContact : extractText(props["담당자"])
issueDate     : extractDate(props["발행일"])
dueDate       : extractDate(props["만기일"])
status        : extractSelect(props["상태"])
note          : extractText(props["비고"])
accessToken   : extractText(props["접근토큰"])
items         : extractText(props["항목"])       // JSON 문자열 저장 필드
```

- [ ] Notion DB 속성명과 코드 내 키 문자열 일치 여부 전수 확인
- [ ] 일치하지 않는 항목 수정
- [ ] `items` 필드 JSON 포맷 합의: `[{"name":"서비스명","quantity":1,"unitPrice":500000}]`
- [ ] `accessToken` 필드: UUID v4 형식 문자열 저장 확인

#### 5-2. 테스트용 Notion 견적서 페이지 생성

Notion DB에 아래 케이스별 테스트 데이터를 생성합니다:

| 케이스 | invoiceId | token | dueDate | 기대 결과 |
|--------|-----------|-------|---------|-----------|
| TC-01  | 유효한 ID  | 정상 토큰 | 미래 날짜 | 견적서 정상 표시 |
| TC-02  | 유효한 ID  | 잘못된 토큰 | 미래 날짜 | `/denied?reason=TOKEN_INVALID` |
| TC-03  | 유효한 ID  | 정상 토큰 | 과거 날짜 | `/denied?reason=TOKEN_EXPIRED` |
| TC-04  | 존재하지 않는 ID | 임의 토큰 | — | `/denied?reason=INVOICE_NOT_FOUND` |
| TC-05  | 유효한 ID  | 토큰 없음 | — | `/denied?reason=TOKEN_INVALID` (proxy) |
| TC-06  | 유효한 ID  | 정상 토큰 | 미래 날짜 | PDF 다운로드 정상 |

#### 5-3. Playwright MCP 테스트 시나리오

아래 테스트 케이스를 Playwright MCP로 실행합니다. 모든 케이스가 통과해야 Phase 5 완료로 간주합니다.

**TC-01: 정상 접근 — 견적서 렌더링 검증**
```
1. 브라우저에서 /invoice/[유효ID]?token=[정상토큰] 접속
2. 페이지 타이틀에 견적서 번호 포함 여부 확인
3. 고객사명, 담당자명 텍스트 표시 확인
4. 품목 테이블 행 개수가 Notion DB 항목 수와 일치 여부 확인
5. 합계 금액이 항목 합산과 일치 여부 확인
6. PDF 다운로드 버튼 표시 확인
```

**TC-02: 잘못된 토큰 — 접근 거부 검증**
```
1. /invoice/[유효ID]?token=INVALID_TOKEN 접속
2. URL이 /denied?reason=TOKEN_INVALID 으로 리디렉션 확인
3. 화면에 "유효하지 않은 링크입니다" 텍스트 표시 확인
4. "담당자에게 문의하기" 버튼 표시 확인 (CONTACT_EMAIL 설정된 경우)
```

**TC-03: 만기된 견적서 — 접근 거부 검증**
```
1. 만기일이 과거인 견적서 ID + 정상 토큰으로 접속
2. URL이 /denied?reason=TOKEN_EXPIRED 으로 리디렉션 확인
3. 화면에 "만기된 견적서입니다" 텍스트 표시 확인
```

**TC-04: 존재하지 않는 견적서**
```
1. /invoice/non-existent-id?token=any 접속
2. URL이 /denied?reason=INVOICE_NOT_FOUND 으로 리디렉션 확인
3. 화면에 "존재하지 않는 견적서입니다" 텍스트 표시 확인
```

**TC-05: 토큰 없이 직접 접근 (proxy 레벨 차단)**
```
1. /invoice/[유효ID] (token 파라미터 없음) 접속
2. URL이 /denied?reason=TOKEN_INVALID 으로 즉시 리디렉션 확인
3. Notion API 호출 없이 차단되었는지 서버 로그 확인
```

**TC-06: PDF 다운로드**
```
1. TC-01과 동일하게 정상 접근
2. "PDF 다운로드" 버튼 클릭
3. 버튼이 "생성 중..." 상태로 변경 확인
4. 파일 다운로드 트리거 확인 (파일명: 견적서_[번호]_[발행일].pdf)
5. Sonner 토스트 "PDF가 다운로드되었습니다." 표시 확인
```

**TC-07: API Route Handler 직접 검증**
```
1. GET /api/invoice/[유효ID]?token=[정상토큰] 호출
2. 응답 status 200, success: true, data 객체 포함 확인
3. 응답 data에 accessToken 필드 미포함 확인 (보안 검증)
4. GET /api/invoice/[유효ID]?token=WRONG → status 401 확인
5. GET /api/invoice/[유효ID] (token 없음) → status 400 확인
```

**TC-08: 반응형 레이아웃 검증**
```
1. 뷰포트 375px (모바일): 테이블 가로 스크롤 동작 확인
2. 뷰포트 768px (태블릿): 레이아웃 깨짐 없음 확인
3. 뷰포트 1440px (데스크톱): A4 카드 중앙 정렬 확인
```

#### 5-4. 엣지 케이스 처리

- [ ] Notion API Rate Limit 초과 시 (429) → 500 응답 대신 Retry-After 헤더 처리
- [ ] `items` JSON이 빈 배열(`[]`)인 경우 → 빈 테이블 상태 표시
- [ ] `items` JSON이 파싱 불가한 경우 → 빈 배열 fallback (현재 구현됨, 시각적 검수)
- [ ] `dueDate`가 없는 경우 → `isInvoiceValid()` true 반환 (현재 구현됨)
- [ ] `clientContact`가 빈 문자열인 경우 → 담당자 행 미표시

### 완료 기준

- [ ] TC-01 ~ TC-08 모든 Playwright MCP 테스트 통과
- [ ] 실제 Notion DB의 모든 필드가 UI에 정상 표시
- [ ] API Route Handler 응답 코드 전 케이스 검증 완료
- [ ] 서버 사이드에서 `accessToken`이 클라이언트 응답에 포함되지 않음 확인

---

## Phase 6: 최적화 및 배포

**[F007] 관련 기능**

### 진행 순서 및 근거

기능이 완성되고 테스트가 통과된 후 최적화와 배포를 진행합니다. 미완성 코드를 배포하면 실제 사용자에게 오류가 노출되므로 반드시 Phase 5 완료 후 진행합니다.

### 작업 항목

#### 6-1. 환경변수 설정

- [ ] Vercel 프로젝트 생성 및 GitHub 저장소 연결
- [ ] Vercel 환경변수 등록:
  ```
  NOTION_API_KEY          = secret_xxxxx
  NOTION_DATABASE_ID      = xxxxx
  NEXT_PUBLIC_APP_URL     = https://[프로젝트명].vercel.app
  CONTACT_EMAIL           = contact@example.com
  ```
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인

#### 6-2. 성능 최적화

- [ ] **캐시 TTL 검토**: 현재 60초 → Notion DB 업데이트 빈도에 맞춰 조정 (권장: 60~300초)
- [ ] **`@react-pdf/renderer` 번들 최적화**: `dynamic import` + `{ ssr: false }` 적용
  ```typescript
  const PdfDownloadButton = dynamic(
    () => import("@/components/invoice/PdfDownloadButton").then(m => m.PdfDownloadButton),
    { ssr: false, loading: () => <button disabled>로딩 중...</button> }
  );
  ```
- [ ] **이미지 최적화**: 회사 로고 이미지 추가 시 `next/image` 사용
- [ ] **폰트 최적화**: `next/font` 사용 (현재 시스템 폰트 사용 중 → 필요 시 적용)

#### 6-3. 보안 점검

- [ ] `NOTION_API_KEY`가 클라이언트 번들에 포함되지 않는지 빌드 산출물 확인
- [ ] `accessToken`이 API 응답에 포함되지 않는지 확인 (이미 구현됨)
- [ ] Response Header: `X-Robots-Tag: noindex` 견적서 페이지에 추가
- [ ] CSP (Content Security Policy) 헤더 설정 (`next.config.js` 또는 `headers()`)

#### 6-4. 배포 및 검증

- [ ] `npm run build` 오류 없이 통과
- [ ] Vercel 자동 배포 확인 (Preview 배포 → 프로덕션 배포 순서)
- [ ] 프로덕션 URL에서 TC-01 ~ TC-06 재검증
- [ ] 크로스 브라우저 PDF 다운로드 테스트:
  - Chrome (최신)
  - Safari (최신, macOS/iOS)
  - Firefox (최신)

#### 6-5. 모니터링 설정

- [ ] Vercel Analytics 활성화 (선택)
- [ ] 오류 로깅: Vercel 함수 로그에서 `[Notion API 오류]`, `[스키마 검증 실패]` 키워드 모니터링

### 완료 기준

- [ ] 프로덕션 URL에서 실제 견적서 접근 정상 동작
- [ ] `npm run build` 경고 0개 (타입 오류, lint 경고 포함)
- [ ] Chrome / Safari / Firefox PDF 다운로드 정상
- [ ] Lighthouse 성능 점수 70 이상 (견적서 뷰 페이지 기준)

---

## 전체 프로젝트 타임라인

```
Day 1  [완료] ████████████████ Phase 1: 프로젝트 초기 설정(골격 구축)
Day 2         ████████████████ Phase 2: 공통 모듈/컴포넌트 개발
              ████████████████ Phase 3: 핵심 기능 개발 (Phase 2와 병렬)
Day 3         ████████████████ Phase 3: 견적서 뷰 UI 완성 + Phase 4: PDF 다운로드
Day 4         ████████████████ Phase 5: API 연동 및 Playwright MCP 테스트
Day 5         ████████████████ Phase 6: 최적화 및 Vercel 배포
```

### 의존성 다이어그램

```
Phase 1 (완료)
    ├── Phase 2 (공통 컴포넌트)  ─────────────┐
    └── Phase 3 (핵심 UI)  ─── Phase 2 완료 후 조합
            └── Phase 4 (PDF)  ──── Phase 3 완료 후
                    └── Phase 5 (API 연동 + 테스트)  ─ Phase 3+4 완료 후
                            └── Phase 6 (최적화 + 배포)
```

**병렬 진행 가능 구간:**
- Phase 2와 Phase 3는 Phase 1 완료 후 병렬 진행 가능 (공통 컴포넌트는 스텁으로 시작 후 완성)

---

## 위험 요소 및 주의사항

### 높음

| 위험 요소 | 영향 | 대응 방안 |
|-----------|------|-----------|
| Notion API 필드명 불일치 | 견적서 데이터 미표시 | Phase 5-1에서 전수 확인 후 `notion.ts` 수정 |
| @react-pdf/renderer 한글 폰트 깨짐 | PDF 파일 사용 불가 | NanumGothic 폰트 등록 또는 html2canvas 대안 사용 |
| NOTION_API_KEY 클라이언트 노출 | 보안 사고 | 서버 컴포넌트/Route Handler 전용 사용 원칙 준수 |

### 중간

| 위험 요소 | 영향 | 대응 방안 |
|-----------|------|-----------|
| Notion API Rate Limit (초당 3 요청) | 다중 접근 시 503 오류 | 60초 캐시로 완화, 동시 접근 많을 경우 Redis 캐시 고려 |
| PDF 품목 다페이지 처리 | PDF 내용 잘림 | html2canvas 멀티 페이지 로직 또는 @react-pdf 페이지 분할 |
| Next.js 16 proxy.ts 컨벤션 | 빌드 오류 | 함수명을 반드시 `proxy`로 내보내야 함 (default 아님) |

### 낮음

| 위험 요소 | 영향 | 대응 방안 |
|-----------|------|-----------|
| Vercel 무료 플랜 함수 실행 시간 제한 (10초) | Notion 응답 지연 시 타임아웃 | 캐시 활용으로 실제 API 호출 최소화 |
| `unstable_cache` API 변경 가능성 | 빌드 경고 | Next.js 16 안정화 이후 `cache()` API로 마이그레이션 검토 |

### 코딩 표준 체크리스트

모든 코드 작성 시 아래 표준을 준수합니다:

- [ ] 들여쓰기: **2칸** (탭 사용 금지)
- [ ] 함수/변수 네이밍: **camelCase** (예: `getInvoice`, `validateAccessToken`)
- [ ] 컴포넌트 네이밍: **PascalCase** (예: `InvoiceHeader`, `PdfDownloadButton`)
- [ ] 주석 및 문서: **한국어** 작성
- [ ] 서버 전용 코드 (Notion API 키): 클라이언트 번들 포함 금지
- [ ] `print:hidden` 클래스: 인쇄/PDF 제외 UI 요소에 적용
- [ ] Tailwind CSS v4: `globals.css`의 CSS 변수 기반 색상 사용

---

## 다음 개발 단계 예고 (Phase 2 이후)

현재 MVP 범위 외 기능으로, 요구사항 확정 후 별도 로드맵으로 분리합니다:

| 기능 | 설명 |
|------|------|
| 견적서 목록 페이지 | Notion DB 전체 조회 + 필터링 (관리자용) |
| 견적서 수락/거절 기능 | 클라이언트 측 서명 또는 상태 변경 API |
| 이메일 발송 자동화 | 견적서 링크를 담당자 이메일로 발송 |
| 견적서 템플릿 관리 | 품목/단가 템플릿 Notion DB 분리 관리 |
| 다국어 지원 | 영어 견적서 지원 (i18n) |
