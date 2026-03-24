# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 코드를 작업할 때 참고해야 할 가이드를 제공합니다.

## 프로젝트 개요

**Invoice Web MVP** — Notion에서 관리하는 견적서를 클라이언트가 공유 링크로 조회하고 PDF로 다운로드하는 서비스입니다.

**기술 스택:**
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui 컴포넌트
- @notionhq/client (Notion API SDK)
- @react-pdf/renderer (PDF 생성)
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

## 다음 개발 단계 (PRD 기반)

### Day 1 (완료됨 — 초기화)
- [x] 스타터킷 데모 파일 제거
- [x] @notionhq/client, zod, @react-pdf/renderer 설치
- [x] 타입 정의 (src/types/invoice.ts)
- [x] Zod 스키마 (src/lib/schemas.ts)
- [x] Notion API 클라이언트 + 캐싱 (src/lib/notion.ts)
- [x] API Route Handler (src/app/api/invoice/[id]/route.ts)
- [x] Proxy 접근 제어 (src/proxy.ts)
- [x] 견적서 뷰 페이지 기본 구조 (src/app/invoice/[id]/page.tsx)
- [x] 접근 거부 페이지 (src/app/denied/page.tsx)
- [x] .env.example 환경변수 템플릿

### Day 1 나머지 — Notion API 실제 연동 테스트
- [ ] NOTION_API_KEY, NOTION_DATABASE_ID .env.local에 설정
- [ ] 실제 Notion DB 필드명과 notion.ts 파싱 코드 맞추기
- [ ] 테스트용 견적서 페이지 생성 및 accessToken 필드 추가

### Day 2 — 견적서 뷰 UI 완성
- [ ] InvoiceHeader 컴포넌트 (회사 정보, 견적서 번호)
- [ ] InvoiceItemsTable 컴포넌트 (품목 테이블)
- [ ] InvoiceSummary 컴포넌트 (합계 섹션)
- [ ] 반응형 레이아웃 완성 (모바일/태블릿/데스크톱)
- [ ] 인쇄 CSS (@media print) 적용

### Day 3 — 접근 제어 완성
- [ ] 토큰 검증 엣지 케이스 테스트
- [ ] 오류 유형별 접근 거부 페이지 UX 개선

### Day 4 — PDF 다운로드
- [ ] PdfDownloadButton 클라이언트 컴포넌트 구현
- [ ] @react-pdf/renderer로 PDF 생성 또는 html2canvas + jsPDF
- [ ] 파일명 자동 생성: `견적서_[번호]_[발행일].pdf`

### Day 5 — 최적화 및 배포
- [ ] Vercel 배포 및 환경변수 설정
- [ ] 캐시 TTL 조정 및 성능 측정
- [ ] 크로스 브라우저 PDF 다운로드 테스트

## 중요한 참고사항

- **언어:** 문서, 주석, 커밋 메시지는 한국어; 코드 식별자는 영어
- **2칸 들여쓰기** 전체 코드베이스에 적용
- **tailwind.config 파일 없음** — Tailwind v4는 `globals.css`를 설정에 사용
- **반응형 디자인 필수** — 모바일과 데스크톱 뷰포트에서 테스트
- **서버 사이드 전용** — NOTION_API_KEY는 절대 클라이언트 번들에 포함 금지
- **proxy.ts** — Next.js 16 컨벤션, 함수명 반드시 `proxy`로 내보내야 함
- **params/searchParams** — Next.js 16 App Router에서 모두 Promise, await 필수
