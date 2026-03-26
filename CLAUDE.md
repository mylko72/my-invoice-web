# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Invoice Web MVP** — Notion에서 관리하는 견적서를 클라이언트가 공유 링크로 조회하고 PDF로 다운로드하는 서비스입니다.

**현재 상태**: ✅ **프로덕션 배포 완료 (2026-03-26)**
- 배포 URL: https://my-invoice-web-orcin.vercel.app/
- 테스트 견적서: https://my-invoice-web-orcin.vercel.app/invoice/32d8d00a-e1e0-808e-b22c-d8fe528b3620

**기술 스택:**
- Next.js 16.1.6 (App Router, Turbopack)
- React 19.2.3
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui 컴포넌트
- @notionhq/client (Notion API SDK)
- html2canvas + jsPDF (PDF 생성, 한글 지원)
- Zod (데이터 검증)
- next-themes (테마 관리)
- Sonner (토스트 알림)
- Lucide React (아이콘)

## 자주 사용하는 명령어

### 개발

```bash
npm run dev           # 개발 서버 시작 (http://localhost:3000)
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 빌드 로컬 실행
npm run lint          # ESLint 실행
```

### 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 파일에 NOTION_API_KEY, NOTION_DATABASE_ID 등 실제 값 입력
```

### 컴포넌트 추가

커스텀 `/add-component` 명령어로 새 UI 컴포넌트를 스캐폴딩합니다:

```bash
/add-component 컴포넌트명
```

### Git 커밋

```bash
/git:commit
```

## 아키텍처 및 핵심 개념

### 디렉터리 구조

```
src/
├── app/                         # Next.js App Router 페이지
│   ├── page.tsx                # 홈 페이지 (서비스 안내)
│   ├── invoice/
│   │   └── [id]/
│   │       ├── page.tsx        # 견적서 뷰 페이지 (핵심)
│   │       └── loading.tsx     # 로딩 스켈레톤 UI
│   ├── denied/
│   │   └── page.tsx           # 접근 거부/오류 페이지
│   ├── api/
│   │   └── invoice/
│   │       └── [id]/
│   │           └── route.ts   # 견적서 API Route Handler
│   ├── layout.tsx              # 루트 레이아웃
│   └── globals.css             # 전역 스타일 (Tailwind v4 + shadcn/ui)
├── components/
│   ├── layout/                 # NavBar, Footer
│   ├── invoice/               # 견적서 UI 컴포넌트
│   │   ├── InvoiceHeader.tsx          # 견적서 번호, 발행일, 만기일
│   │   ├── InvoiceClientInfo.tsx      # 고객사명, 담당자
│   │   ├── InvoiceItemsTable.tsx      # 품목 테이블
│   │   ├── InvoiceSummary.tsx         # 공급가액, 부가세, 합계
│   │   ├── InvoiceStatusBadge.tsx     # 상태 배지 (draft/sent/accepted)
│   │   ├── InvoiceNote.tsx            # 비고
│   │   ├── InvoiceActions.tsx         # PDF 다운로드, 인쇄 버튼
│   │   └── PdfDownloadButton.tsx      # PDF 생성 로직 (클라이언트 컴포넌트)
│   └── ui/                    # shadcn/ui 컴포넌트
├── contexts/
│   └── ThemeContext.tsx        # 다크/라이트 모드 Context & 훅
├── lib/
│   ├── utils.ts                # cn() 함수
│   ├── notion.ts               # Notion API 클라이언트 + 캐싱
│   └── schemas.ts              # Zod 스키마 (Notion 응답 검증)
├── types/
│   └── invoice.ts              # Invoice 관련 TypeScript 타입
├── utils/
│   └── format.ts              # 포맷 유틸리티 (날짜, 금액, PDF 파일명)
└── proxy.ts                    # Next.js 16 Proxy (구 middleware) — 토큰 접근 제어
```

### 핵심 사용자 여정

```
클라이언트 → /invoice/[id]?token=[accessToken]
              ↓ proxy.ts: token 파라미터 존재 여부 확인
              ↓ page.tsx: getInvoice(id) Notion API 조회 (60초 캐시)
              ↓ validateAccessToken() + isInvoiceValid() 2차 검증
              ↓ 견적서 렌더링
              ↓ PDF 다운로드 or 인쇄
```

### 테마 관리

앱은 **ThemeContext** (`src/contexts/ThemeContext.tsx`)를 통해 다크/라이트 모드를 관리합니다:

- `getInitialTheme()` 함수로 localStorage → 시스템 설정 순으로 초기 테마 결정
- `useEffect`에서 DOM에 `dark` 클래스 적용 (서버/클라이언트 불일치 방지)
- `localStorage` 키: `"theme"`

**컴포넌트에서 사용:**

```tsx
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>토글: {theme}</button>;
}
```

### Notion API 연동 패턴

```typescript
// src/lib/notion.ts
import { getInvoice, validateAccessToken, isInvoiceValid } from "@/lib/notion";

// 서버 컴포넌트에서 사용
const invoice = await getInvoice(id);        // 60초 캐시 적용
validateAccessToken(invoice, token);          // 토큰 검증
isInvoiceValid(invoice);                      // 만기일 확인
```

### Zod 스키마 사용

```typescript
// src/lib/schemas.ts
import { validateInvoice } from "@/lib/schemas";

const validated = validateInvoice(rawData);   // safeParse 래퍼
```

### PDF 생성 패턴

PdfDownloadButton (`src/components/invoice/PdfDownloadButton.tsx`)은 클라이언트 컴포넌트로, html2canvas + jsPDF를 사용합니다:

```typescript
"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 견적서 DOM을 이미지로 캡처 → PDF로 변환
const canvas = await html2canvas(element, { scale: 2 });
const imgData = canvas.toDataURL("image/png");
const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
pdf.save(`견적서_${invoiceNumber}_${issueDate}.pdf`);
```

**주요 특징:**
- 한글 깨짐 없음 (DOM 방식)
- 다크/라이트 모드 스타일 그대로 캡처
- 동적 import로 초기 번들 크기 최적화 (InvoiceActions에서)

### 스타일링 규칙

- **Tailwind CSS v4**를 `globals.css`에서 `@import "tailwindcss"`로 CSS 변수와 함께 사용
- **shadcn/ui** 컴포넌트는 OKLch 색상 변수를 사용하여 테마 적용
- `@/lib/utils`의 `cn()`을 사용하여 Tailwind 클래스 조건부 병합
- `print:hidden` 클래스: 인쇄/PDF 출력 시 숨김 처리

### 경로 별칭 (Path Aliases)

- `@/*` → `./src/*`

### Next.js 16 특이사항

- **proxy.ts** — Next.js 16에서 `middleware.ts`가 `proxy.ts`로 변경됨. 함수 이름도 `proxy`로 내보내야 함
- **params/searchParams** — `page.tsx`에서 `params`와 `searchParams`가 모두 `Promise` 타입 (await 필요)

## 환경변수

`.env.example` 파일 참조. `.env.local`에 실제 값 설정:

```bash
NOTION_API_KEY=          # Notion Integration 시크릿
NOTION_DATABASE_ID=      # 견적서 Notion DB ID
INVOICE_TOKEN_SECRET=    # 선택 사항 (HMAC 방식 시)
NEXT_PUBLIC_APP_URL=     # 배포 URL
CONTACT_EMAIL=           # 담당자 이메일 (접근 거부 페이지 표시용)
```

## 커스텀 명령어 & 에이전트

### 사용 가능한 커스텀 명령어

1. **`/add-component 컴포넌트명`** — `src/components/ui/`에 새 UI 컴포넌트 생성
2. **`/git:commit`** — 이모지 & 한국어 메시지 지원 대화형 커밋 다이얼로그 열기

### 사용 가능한 커스텀 에이전트

- **`code-reviewer`** — 코드 품질, 잠재적 문제, 모범 사례 검토
- **`docs-writer`** — 한국어 문서 작성 및 코드에 한국어 주석 추가
- **`notion-api-expert`** — Notion API 연동 전문 에이전트

## 프로덕션 배포 (2026-03-26 완료)

### 배포 환경
- **배포 플랫폼**: Vercel
- **프로덕션 URL**: https://my-invoice-web-orcin.vercel.app/
- **브랜치**: main
- **자동 배포**: GitHub push → Vercel 자동 배포 활성화

### 환경변수 설정 (Vercel)
```bash
NOTION_API_KEY          # Notion Integration 시크릿 (서버 전용)
NOTION_DATABASE_ID      # 견적서 Notion DB ID
CONTACT_EMAIL           # 담당자 이메일 (접근 거부 페이지)
NEXT_PUBLIC_APP_URL     # 프로덕션 URL (선택)
```

### 성능 지표 (Lighthouse)
- **First Contentful Paint**: 408ms ✅
- **DOM Interactive**: 406ms ✅
- **메모리**: 40MB ✅
- **네트워크**: 28/28 요청 (100% 성공) ✅

### 모니터링
- **Vercel Analytics**: 자동 활성화 (Web Vitals 수집)
- **로깅**: API Route Handler에서 모든 에러 코드 로깅
- **브라우저 콘솔**: PDF 생성 과정 상세 로깅 ([PDF] 접두어)

---

## 개발 이력 (완료됨)

### Phase 1: 프로젝트 초기 설정 (2026-03-23) ✅
- [x] 패키지 설치 및 타입 정의
- [x] Notion API 클라이언트 + 캐싱 (60초)
- [x] API Route Handler 구현
- [x] Proxy 접근 제어 설정

### Phase 2: 공통 컴포넌트 (2026-03-24) ✅
- [x] NavBar, Footer 정비
- [x] InvoiceHeader, InvoiceClientInfo, InvoiceItemsTable 등 6개 컴포넌트
- [x] 로딩 스켈레톤 UI

### Phase 3: 견적서 뷰 UI (2026-03-25) ✅
- [x] 견적서 뷰 페이지 완성
- [x] 반응형 레이아웃 (모바일/태블릿/데스크톱)
- [x] 인쇄 CSS (@media print)

### Phase 4: PDF 다운로드 (2026-03-25) ✅
- [x] html2canvas + jsPDF로 PDF 생성 (한글 지원)
- [x] 동적 import로 번들 최적화
- [x] Sonner 토스트 알림

### Phase 5: API 연동 및 테스트 (2026-03-26) ✅
- [x] Notion DB 필드 매핑 검증
- [x] Playwright E2E 테스트 (6/6 통과)
- [x] 모든 에러 시나리오 검증

### Phase 6: 최적화 및 배포 (2026-03-26) ✅
- [x] Vercel 배포 및 환경변수 설정
- [x] CSP 헤더 + X-Robots-Tag 설정 (next.config.ts)
- [x] 보안 점검 (NOTION_API_KEY 클라이언트 제외)
- [x] 프로덕션 검증 (TC-01~TC-03 통과)

## 핵심 개발 패턴

### 데이터 흐름

**페이지 렌더링:**
```
1. 클라이언트: /invoice/[id]?token=[token] 접근
2. Proxy (src/proxy.ts): token 파라미터 필수 확인
3. Page (src/app/invoice/[id]/page.tsx):
   - getInvoice(id) → Notion API 조회 (60초 캐시)
   - validateAccessToken(invoice, token)
   - isInvoiceValid(invoice)
4. 컴포넌트 조합: InvoiceHeader + InvoiceItemsTable + InvoiceSummary
5. 클라이언트: PDF 다운로드 or 인쇄
```

### 에러 처리
- **404 INVOICE_NOT_FOUND**: Notion에 없는 ID
- **410 TOKEN_EXPIRED**: dueDate가 과거 날짜
- **401 TOKEN_INVALID**: accessToken이 불일치 또는 필수인데 없음
- **500 SERVER_ERROR**: Notion API 호출 실패

모든 에러는 `/denied?reason=[CODE]`로 리다이렉션

### 컴포넌트 개발 시 주의사항

1. **서버 vs 클라이언트 경계**
   - `src/app/invoice/[id]/page.tsx` — 서버 컴포넌트 (Notion API 호출)
   - `PdfDownloadButton.tsx` — 클라이언트 컴포넌트 ("use client")
   - 다른 컴포넌트는 기본 서버 컴포넌트

2. **props 인터페이스** (`src/types/invoice.ts` 참조)
   ```typescript
   // InvoiceHeader
   interface InvoiceHeaderProps {
     invoiceNumber: string;
     issueDate: string;
     dueDate: string;
   }
   ```

3. **인쇄/PDF 제외**
   - `print:hidden` 클래스로 인쇄 시 숨김 처리
   - NavBar, Footer, InvoiceActions에 적용됨

---

## 일반 개발 가이드

### 코드 스타일
- **언어**: 문서, 주석, 커밋 메시지는 한국어; 코드 식별자는 영어
- **들여쓰기**: 2칸 (탭 금지)
- **네이밍**: camelCase (함수/변수), PascalCase (컴포넌트)

### 스타일링
- **Tailwind CSS v4**: `globals.css`에서 `@import "tailwindcss"`로 CSS 변수 활용
- **shadcn/ui**: OKLch 색상 변수 사용 (테마 자동 적용)
- **cn() 함수**: `@/lib/utils`에서 조건부 클래스 병합

### Next.js 16 특이사항
- **proxy.ts**: middleware.ts 대신 사용, 함수명은 `proxy`로 내보내야 함
- **params/searchParams**: 모두 Promise 타입, await 필수
- **dynamic import**: PDF 관련 라이브러리는 `{ ssr: false }` 옵션 추가

### 보안
- **NOTION_API_KEY**: 서버 코드(Route Handler, 서버 컴포넌트)에서만 사용
- **accessToken**: API 응답에 절대 포함하지 않음
- **CSP 헤더**: next.config.ts에서 설정 (script-src, style-src, connect-src)
- **X-Robots-Tag**: noindex로 검색 엔진 색인 차단

---

## 문제 해결

### "빌드 실패: @types/react-pdf"
```
Error: typescript is missing
```
**원인**: @types/react-pdf이 dependencies에 있으면 설치 체인 끊김
**해결**: devDependencies로 옮김 (`npm install --save-dev @types/react-pdf`)

### "PDF 한글 깨짐"
**원인**: @react-pdf/renderer의 폰트 이슈
**해결**: html2canvas + jsPDF 방식 사용 (현재 구현됨)

### "Notion API 404"
**원인**: NOTION_DATABASE_ID가 잘못되었거나 필드명 불일치
**해결**: `src/lib/notion.ts`의 extractText() 호출 시 필드명 확인

---

## 자주 사용되는 명령어 정리

```bash
# 개발
npm run dev                # http://localhost:3000에서 개발 서버 시작
npm run build             # 프로덕션 빌드 (94초 소요)
npm run start             # 빌드된 앱 로컬 실행

# 검증
npm run lint              # ESLint 실행 (zero warnings 목표)

# 환경 설정
cp .env.example .env.local
# NOTION_API_KEY, NOTION_DATABASE_ID 등 입력

# Git
/git:commit              # 이모지 + 한국어 메시지 커밋 다이얼로그

# 컴포넌트 추가 (shadcn/ui)
/add-component Button    # src/components/ui/Button.tsx 생성
```
