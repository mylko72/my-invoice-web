# Phase 2: 공통 모듈/컴포넌트 개발 계획

## 📌 개요

견적서 UI(Phase 3)와 PDF(Phase 4) 모두 공유하는 공통 컴포넌트 7개를 개발합니다.
모든 컴포넌트는 TypeScript Props 기반, Tailwind CSS v4 OKLch 색상 변수, 2칸 들여쓰기를 준수합니다.

---

## 🎯 Task 1: InvoiceStatusBadge 컴포넌트

**파일:** `src/components/invoice/InvoiceStatusBadge.tsx`

**Props:**
```typescript
interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}
```

**구현:**
- draft → bg-muted (회색)
- sent → bg-sky-100 text-sky-800 (파란색, 다크모드: bg-sky-900)
- accepted → bg-emerald-100 text-emerald-800 (초록색)
- formatInvoiceStatus() 유틸리티로 레이블 표시
- 스타일: px-3 py-1 rounded-full text-xs font-semibold

**의존성:** 없음

---

## 🎯 Task 2: InvoiceHeader 컴포넌트

**파일:** `src/components/invoice/InvoiceHeader.tsx`

**Props:**
```typescript
interface InvoiceHeaderProps {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  companyName?: string;
  status?: InvoiceStatus;
}
```

**구현:**
- 좌측: 회사명(선택) + 견적서 번호 (text-lg font-bold)
- 우측: 상태 뱃지(선택) + 발행일 + 만기일
- 레이아웃: flex justify-between
- 모바일: flex-col md:flex-row
- formatDate() 활용

**의존성:** Task 1 (InvoiceStatusBadge)

---

## 🎯 Task 3: InvoiceClientInfo 컴포넌트

**파일:** `src/components/invoice/InvoiceClientInfo.tsx`

**Props:**
```typescript
interface InvoiceClientInfoProps {
  clientName: string;
  clientContact?: string;
}
```

**구현:**
- 보더드 박스: border border-border rounded-md p-4
- 고객사: {clientName} (필수)
- 담당자: {clientContact} (조건부)
- 레이블: font-semibold

**의존성:** 없음

---

## 🎯 Task 4: InvoiceNote 컴포넌트

**파일:** `src/components/invoice/InvoiceNote.tsx`

**Props:**
```typescript
interface InvoiceNoteProps {
  note: string;
}
```

**구현:**
- 빈 문자열이면 null 반환 (렌더링 X)
- 공백만 있어도 미렌더링
- 스타일: border border-border rounded-md p-4 bg-muted/50
- whitespace-pre-wrap으로 줄 바꿈 유지
- 헤더: h4 "비고"

**의존성:** 없음

---

## 🎯 Task 5: InvoiceItemsTable 컴포넌트

**파일:** `src/components/invoice/InvoiceItemsTable.tsx`

**Props:**
```typescript
interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}
```

**구현:**
- 테이블: border-collapse, w-full
- 컬럼: 품명, 수량, 단가, 공급가액, 부가세
- 헤더: border-b border-border font-semibold text-sm
- 데이터 행: border-b border-border/50 py-2
- 금액: formatAmount() 적용, text-right
- 모바일: overflow-x-auto, min-w-max
- 텍스트: text-xs sm:text-sm

**의존성:** 없음

---

## 🎯 Task 6: InvoiceSummary 컴포넌트

**파일:** `src/components/invoice/InvoiceSummary.tsx`

**Props:**
```typescript
interface InvoiceSummaryProps {
  summary: InvoiceSummary;
}
```

**구현:**
- 컨테이너: flex justify-end w-64
- 공급가액: 공급가액 + formatAmount(totalSupply)
- 부가세: 부가세(10%) + formatAmount(totalTax)
- 총액: border-t pt-2, font-bold text-lg text-primary
- 모든 행: flex justify-between
- 간격: space-y-2

**의존성:** 없음

---

## 🎯 Task 7: InvoiceActions 클라이언트 컴포넌트

**파일:** `src/components/invoice/InvoiceActions.tsx`

**Props:**
```typescript
"use client";

interface InvoiceActionsProps {
  invoiceNumber: string;
  issueDate: string;
  invoiceData: Invoice;
}
```

**구현:**
- "use client" 선언 (필수)
- 버튼 영역: flex justify-end gap-3 mb-6 print:hidden
- 인쇄 버튼: onClick={() => window.print()}
- PDF 다운로드: Phase 4 준비 주석
- 버튼 스타일: px-4 py-2 rounded-md font-medium hover:opacity-90

**의존성:** 없음

---

## 🎯 Task 8: 로딩 스켈레톤 검토

**파일:** `src/app/invoice/[id]/loading.tsx`

**검증:**
- animate-pulse 클래스 확인
- bg-muted 색상 변수 사용
- max-w-4xl mx-auto 컨테이너
- 섹션: 버튼, 헤더, 고객정보, 테이블, 합계
- 레이아웃이 실제 견적서와 1:1 일치
- 주석 정리

**의존성:** Task 1~7 모두

---

## ✅ 완료 기준

1. `src/components/invoice/` 디렉터리 생성
2. 7개 컴포넌트 파일 생성
3. 모든 Props 인터페이스 정의
4. TypeScript 컴파일 오류 없음
5. `npm run lint` 통과
6. 로딩 스켈레톤 검토 완료

---

## 📚 참고

- 포맷 유틸리티: `src/utils/format.ts` (formatDate, formatAmount, formatCurrency, formatInvoiceStatus)
- 타입 정의: `src/types/invoice.ts` (Invoice, InvoiceItem, InvoiceSummary, InvoiceStatus)
- 기존 레이아웃: NavBar, Footer (print:hidden 패턴 참조)
- 로딩 스켈레톤: `src/app/invoice/[id]/loading.tsx` (기존 구조 유지)
