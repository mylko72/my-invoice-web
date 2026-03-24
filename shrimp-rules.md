# Invoice Web MVP — AI 개발 가이드라인

> **AI 에이전트 전용:** 이 문서는 Invoice Web 코드베이스에서 작업하는 AI 에이전트를 위한 프로젝트 특화 규칙을 정의합니다. 일반 개발자 문서가 **아닙니다.**

## 프로젝트 개요

**Invoice Web MVP** — Notion 데이터베이스에서 관리하는 견적서를 클라이언트가 보안 링크를 통해 조회하고 PDF로 다운로드할 수 있는 웹 애플리케이션입니다.

**기술 스택:**
- Next.js 16.1.6 (App Router + proxy.ts 미들웨어)
- React 19.2.3 (기본값: Server Components)
- TypeScript 5
- Tailwind CSS v4 (globals.css에서 `@import "tailwindcss"`)
- shadcn/ui (사전 구축된 컴포넌트)
- @notionhq/client (Notion API)
- Zod (데이터 검증)
- next-themes + 커스텀 ThemeContext (다크/라이트 모드)

---

## 코드 표준

### 들여쓰기 및 포맷팅
- **2칸 들여쓰기** 전체 코드베이스에 적용 (필수)
- 탭 사용 금지, 항상 스페이스 사용
- 새로운 규칙 추가 전에 `eslint.config.mjs` 확인

### 네이밍 컨벤션

| 유형 | 규칙 | 예시 | 위치 |
|------|------|------|------|
| **React 컴포넌트** | PascalCase | `InvoiceHeader`, `NavBar`, `Button` | `src/components/ui/`, `src/components/layout/` |
| **함수** | camelCase | `getInvoice()`, `validateAccessToken()`, `toggleTheme()` | 모든 파일 |
| **변수** | camelCase | `invoiceId`, `accessToken`, `totalSupply` | 모든 파일 |
| **타입 이름** | PascalCase | `Invoice`, `InvoiceItem`, `ThemeContextType` | `src/types/` |
| **Zod 추론 타입** | snake_case | `invoice_schema`, `invoice_item_schema` | `src/lib/schemas.ts` |
| **환경변수** | SCREAMING_SNAKE_CASE | `NOTION_API_KEY`, `NEXT_PUBLIC_APP_URL` | `.env.local` |
| **CSS 클래스** | Tailwind 유틸리티 | `bg-primary`, `text-foreground`, `print:hidden` | JSX className |

### 주석 및 문서화

- **모든 주석은 한국어로 작성** — 예외: 타입 정의의 간단한 영어 인라인 노트
- **함수/클래스 블록 주석** — 목적, 파라미터, 반환값 설명
- **인라인 주석은 최소한으로** — 비자명한 로직에만
- **패턴 예시:**
  ```tsx
  /**
   * 견적서를 Notion API에서 조회합니다.
   * 60초 캐시가 적용됩니다.
   * @param id - 견적서 Notion 페이지 ID
   * @returns Invoice 객체 또는 null (조회 실패 시)
   */
  export async function getInvoice(id: string): Promise<Invoice | null> {
    // 구현...
  }
  ```

---

## Next.js 16 특화 패턴

### Proxy 미들웨어 (src/proxy.ts)

**중요:** Next.js 16은 `middleware.ts` 대신 `proxy.ts`를 사용합니다. `middleware.ts`를 생성하거나 수정하지 마세요.

- **함수명은 반드시 `proxy`:** `export function proxy(request: NextRequest) { ... }`
- **라우트 매칭용 config 내보내기:** `export const config`에 `matcher` 배열 정의
- **Proxy에서 Notion API 호출 금지** — Edge Runtime 제한
  - URL/파라미터 검사만 수행 (토큰 존재 여부, 경로 매칭)
  - 실제 검증은 Route Handler나 Server Component에 위임
- **구조 예시:**
  ```tsx
  export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    if (pathname.startsWith("/invoice/")) {
      const token = searchParams.get("token");
      if (!token) {
        return NextResponse.redirect(new URL("/denied?reason=TOKEN_INVALID", request.url));
      }
    }
    return NextResponse.next();
  }

  export const config = {
    matcher: ["/invoice/:path*"],
  };
  ```

### 비동기 params/searchParams

**중요:** Next.js 16 App Router에서 `params`와 `searchParams`는 Promise입니다.

- **반드시 `await` 사용:**
  ```tsx
  export default async function InvoicePage({ params, searchParams }: PageProps) {
    const { id } = await params;          // ✅ 올바름
    const { token } = await searchParams;  // ✅ 올바름
    // const { id } = params;              // ❌ 틀림: await 누락
  }
  ```
- **타입 어노테이션 필수:**
  ```tsx
  interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string }>;
  }
  ```

### Server Component vs Client Component

- **기본값: Server Component** — 페이지와 레이아웃은 서버 전용
- **`"use client"` 사용 조건:**
  - 이벤트 리스너 필요 (onClick, onChange)
  - 상태 필요 (useState, useReducer)
  - 이펙트 필요 (useEffect)
  - Context Provider (ThemeProvider, Toaster)
- **패턴:**
  ```tsx
  "use client";

  import { useTheme } from "@/contexts/ThemeContext";

  export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return <button onClick={toggleTheme}>토글</button>;
  }
  ```

---

## Notion API 연동

### 워크플로우 개요

1. **클라이언트 요청:** `/invoice/[id]?token=XXX`
2. **proxy.ts** — `token` 파라미터 존재 여부 확인 → 없으면 `/denied`로 리디렉션
3. **Server Component (page.tsx)** — `lib/notion.ts`에서 `getInvoice(id)` 호출
4. **Server Component에서 검증:**
   - `validateAccessToken(invoice, token)` 호출 — 토큰과 `invoice.accessToken` 일치 확인
   - `isInvoiceValid(invoice)` 호출 — `dueDate` 확인
   - 둘 중 하나 실패 시 `/denied?reason=...`로 리디렉션
5. **견적서 렌더링** 또는 오류 페이지로 리디렉션

### 핵심 함수 (src/lib/notion.ts)

**다음 함수들을 구현해야 합니다:**

- `getInvoice(id: string): Promise<Invoice | null>`
  - Notion API에서 60초 캐시로 조회
  - 타입 검증된 Invoice 객체 반환
  - 오류 시 null 반환
- `validateAccessToken(invoice: Invoice, token: string): boolean`
  - `token`과 `invoice.accessToken` 비교 (엄격한 동일성)
  - 일치 시 true, 아니면 false
- `isInvoiceValid(invoice: Invoice): boolean`
  - `invoice.dueDate` 파싱 (형식: YYYY-MM-DD)
  - 만기일이 지나지 않으면 true, 지났으면 false

### Zod 스키마 검증

**모든 Notion API 응답은 `lib/schemas.ts`를 통해 검증해야 합니다:**

- 스키마 정의: `const invoiceSchema = z.object({ ... })`
- 검증 함수 작성: `export function validateInvoice(data: unknown): InvoiceSchema | null`
- **반드시 `.safeParse()` 사용** (`.parse()` 금지)
- **검증은 Route Handler나 getInvoice()에서**, proxy.ts에서 아님
- **예시:**
  ```tsx
  export function validateInvoice(data: unknown): InvoiceSchema | null {
    const result = invoiceSchema.safeParse(data);
    if (!result.success) {
      console.error("[스키마 검증 실패]", result.error.flatten());
      return null;
    }
    return result.data;
  }
  ```

### Notion 필드 추가

**Notion DB에 새 필드 추가 시:**

1. **`src/types/invoice.ts` 업데이트** — `Invoice` 또는 `InvoiceItem` 인터페이스에 필드 추가
2. **`src/lib/schemas.ts` 업데이트** — 해당 Zod 스키마에 필드 추가
3. **`src/lib/notion.ts` 업데이트** — Notion API 응답에서 새 필드 파싱
4. **검증 테스트** — 파싱된 데이터 사용 전에 `validateInvoice()` 호출

**예: Invoice에 "companyLogo" 필드 추가**
- `src/types/invoice.ts` — `companyLogo: string;` 추가
- `src/lib/schemas.ts` — `companyLogo: z.string().url()` 스키마에 추가
- `src/lib/notion.ts` — Notion 페이지 속성에서 추출하여 스키마에 전달

---

## 다중 파일 조정 요구사항

### 새로운 Notion 필드 추가

**동시에 업데이트해야 할 파일:**
1. `src/types/invoice.ts` — 인터페이스에 속성 추가
2. `src/lib/schemas.ts` — Zod 스키마에 필드 + 검증 규칙 추가
3. `src/lib/notion.ts` — Notion API 응답에서 필드 추출
4. `src/app/invoice/[id]/page.tsx` 또는 컴포넌트 — 필드 표시

**검증:** `npm run build` 실행하여 타입 불일치 확인

### 새로운 보호 페이지 추가 (/invoice/[id] 외)

**업데이트할 파일:**
1. `src/proxy.ts` — `config.matcher` 배열에 새 라우트 추가 및/또는 조건 로직 업데이트
2. `src/app/...` 디렉터리에 새 페이지 파일 생성
3. 페이지 컴포넌트에 토큰 검증 구현

**예: /contract/[id]?token=XXX 추가**
```tsx
// src/proxy.ts
export const config = {
  matcher: ["/invoice/:path*", "/contract/:path*"], // 라우트 추가
};

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname.startsWith("/invoice/") || pathname.startsWith("/contract/")) {
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/denied?reason=TOKEN_INVALID", request.url));
    }
  }
  return NextResponse.next();
}
```

### 테마 변경 (다크/라이트 모드)

**업데이트할 파일:**
1. `src/app/globals.css` — 라이트/다크 테마 색상 변수 정의
2. `src/contexts/ThemeContext.tsx` — `theme` 상태 및 `localStorage` 관리
3. 테마 사용 컴포넌트 — `useTheme()` 임포트 및 조건부 적용 필요 시
4. Tailwind 스타일 — Tailwind 기본 다크 모드 또는 CSS 변수 사용

**패턴:**
```css
/* globals.css — 라이트 모드 (기본값) */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

/* 다크 모드 */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
```

**컴포넌트에서:**
```tsx
// CSS 변수로 라이트/다크 색상 자동 전환
<div className="bg-background text-foreground">
  {/* Tailwind가 --background와 --foreground 변수 사용 */}
</div>
```

---

## 프레임워크 및 라이브러리 사용법

### Notion API (@notionhq/client)

- **임포트:** `import { Client } from "@notionhq/client";`
- **초기화:** `src/lib/notion.ts`에서만 생성
- **API 키 노출 금지:** 모든 Notion 호출을 Server Component나 Route Handler에서만
- **오류 처리:** 오류 catch 후 null 반환 또는 `/denied?reason=SERVER_ERROR`로 리디렉션

### Zod 검증

- **임포트:** `import { z } from "zod";`
- **`src/lib/schemas.ts`에서 스키마 정의:**
  ```tsx
  export const invoiceSchema = z.object({
    id: z.string().uuid(),
    invoiceNumber: z.string().min(1),
    // ...
  });
  ```
- **미지의 데이터에는 `.safeParse()` 사용:**
  ```tsx
  const result = invoiceSchema.safeParse(rawData);
  if (!result.success) return null;
  const invoice = result.data;
  ```

### Tailwind CSS v4

- **임포트:** `src/app/globals.css` 상단에 `@import "tailwindcss";`
- **CSS 변수:** `:root`와 `.dark`에서 OKLch 색상 정의 (globals.css 참조)
- **유틸리티:** `className` 속성에서 Tailwind 클래스 사용
- **인쇄 스타일:** `print:` 접두사로 인쇄 전용 스타일 적용
  - `print:hidden` — 인쇄/PDF 내보내기 시 요소 숨김
  - `print:bg-white` — 인쇄 시 배경색 오버라이드
  - `print:py-0 print:px-0` — 인쇄 시 패딩 제거
- **반응형:** `sm:`, `md:`, `lg:` 접두사로 모바일 우선 설계

### shadcn/ui 컴포넌트

- **위치:** `src/components/ui/` (사전 설치됨)
- **임포트:** `import { Button } from "@/components/ui/button";`
- **커스터마이제이션:** 컴포넌트 파일 직접 수정 (외부 props/config 없음)
- **스타일링:** 컴포넌트는 Tailwind 클래스 사용, 스타일 변경은 파일 직접 편집

**사전 설치된 컴포넌트:**
- `Button`, `Card`, `Input`, `Label`, `Dialog`, `Separator`, `Table`
- `Badge`, `Alert`, `Checkbox`, `Radio`, `Select`, `Accordion`

**새로운 shadcn/ui 컴포넌트 추가:**
```bash
npm i -D shadcn-cli
npx shadcn-cli@latest add [component-name]
```

### Next-Themes & ThemeContext

- **커스텀 구현:** `src/contexts/ThemeContext.tsx`
- **next-themes 직접 사용 금지** — `ThemeContext` 사용
- **새 페이지의 경우:** `ThemeProvider`에 래핑 (이미 `src/app/layout.tsx`에서 완료)
- **컴포넌트에서 테마 사용:**
  ```tsx
  "use client";

  import { useTheme } from "@/contexts/ThemeContext";

  export function MyComponent() {
    const { theme, toggleTheme } = useTheme();
    return <button onClick={toggleTheme}>현재: {theme}</button>;
  }
  ```
- **localStorage 키:** `"theme"` (`"light"` 또는 `"dark"` 저장)

### Sonner (토스트 알림)

- **설정 위치:** `src/app/layout.tsx`에 `<Toaster position="bottom-right" richColors />`
- **사용 방법:**
  ```tsx
  "use client";

  import { toast } from "sonner";

  export function MyComponent() {
    const handleClick = () => {
      toast.success("성공!");
      toast.error("오류가 발생했습니다.");
      toast.info("정보");
    };
  }
  ```
- **중복 Toaster 금지** — RootLayout에서만

### Lucide React (아이콘)

- **임포트:** `import { Download, Printer } from "lucide-react";`
- **사용:** `<Download size={20} className="..." />`
- **프로젝트 주요 아이콘:**
  - `Download` — PDF 다운로드 버튼
  - `Printer` — 인쇄 버튼
  - `Moon`, `Sun` — 테마 토글

---

## 스타일링 및 레이아웃 규칙

### Tailwind CSS 패턴

- **모든 스타일링에 유틸리티 클래스 사용** (globals.css 제외 CSS 파일 금지)
- **조건부 클래스** — `src/lib/utils.ts`의 `cn()` 사용:
  ```tsx
  import { cn } from "@/lib/utils";

  <div className={cn("기본-클래스", isActive && "추가-클래스")}>
    {/* ... */}
  </div>
  ```
- **다크 모드** — `:root`와 `.dark` CSS 변수로 자동 처리
- **반응형 설계** — 모바일 우선 접근:
  ```tsx
  <div className="text-sm md:text-base lg:text-lg">
    {/* 모바일에서 작음, md+에서 중간, lg+에서 큼 */}
  </div>
  ```

### 인쇄 스타일 (@media print)

- **`print:` 접두사 사용** — 인쇄 전용 스타일
- **일반적인 패턴:**
  - `print:hidden` — 네비게이션, 버튼, UI 요소 숨김
  - `print:bg-white` — 인쇄용 흰색 배경
  - `print:py-0 print:px-0` — 컴팩트 인쇄용 패딩 제거
  - `print:break-inside-avoid` — 요소 내부 페이지 나눔 방지
- **예시:**
  ```tsx
  <div className="mb-6 print:hidden">
    {/* 인쇄 시 버튼 숨김 */}
  </div>

  <div className="bg-white print:bg-white py-8 print:py-0">
    {/* 견적서 콘텐츠, 인쇄에 최적화 */}
  </div>
  ```

### 컴포넌트 구조 패턴

**UI 컴포넌트 권장 구조:**
```tsx
"use client";  // 필요한 경우만

import { cn } from "@/lib/utils";

interface ComponentProps {
  className?: string;
  // ... 다른 props
}

/**
 * 컴포넌트 설명
 */
export function ComponentName({ className, ...props }: ComponentProps) {
  return (
    <div className={cn("기본-클래스", className)}>
      {/* 콘텐츠 */}
    </div>
  );
}
```

---

## 라우팅 및 페이지 구조

### 디렉터리 구조 규칙

```
src/app/
├── page.tsx              # 루트 페이지 (/)
├── layout.tsx            # RootLayout
├── globals.css
├── invoice/
│   └── [id]/
│       ├── page.tsx      # 견적서 뷰 페이지 (/invoice/[id])
│       ├── loading.tsx   # 로딩 스켈레톤
├── denied/
│   └── page.tsx          # 오류/접근 거부 페이지 (/denied)
└── api/
    └── invoice/
        └── [id]/
            └── route.ts  # API 엔드포인트 (GET /api/invoice/[id])
```

### 동적 라우트 파라미터

**`[id]` 파라미터를 가진 페이지의 경우:**
1. **params와 searchParams를 Promise로 타입 지정**
2. **await를 사용하여 접근**
3. **예시:**
   ```tsx
   interface PageProps {
     params: Promise<{ id: string }>;
     searchParams: Promise<{ token?: string }>;
   }

   export default async function InvoicePage({ params, searchParams }: PageProps) {
     const { id } = await params;
     const { token } = await searchParams;
   }
   ```

### redirect vs return

- **다른 페이지로 이동할 때 `redirect()` 사용:**
  ```tsx
  import { redirect } from "next/navigation";

  if (!invoice) {
    redirect("/denied?reason=INVOICE_NOT_FOUND");
  }
  ```
- **redirect 후 JSX 반환 금지** — 작동하지 않음
- **쿼리 파라미터로 오류 이유 전달** — `/denied/page.tsx`에서 사용

---

## 금지된 행동

### ❌ 절대 금지

1. **브라우저 번들에 `NOTION_API_KEY` 포함 금지**
   - `.env.local`에 저장 (서버 전용)
   - Server Component나 Route Handler에서만 접근
   - 클라이언트 번들에 노출 금지

2. **`middleware.ts` 생성 또는 수정 금지**
   - Next.js 16은 `proxy.ts` 사용
   - proxy 미들웨어로만 라우트 레벨 보안 적용

3. **proxy.ts에서 Notion API 호출 금지**
   - Proxy는 Edge Runtime에서 실행되어 컨텍스트 제한
   - API 호출은 Route Handler나 Server Component로 이동

4. **테스트되지 않은 Zod 스키마 사용 금지**
   - 모든 Notion API 응답은 검증 필수
   - `.safeParse()` 사용하고 실패 케이스 처리

5. **토큰 검증 로직 하드코딩 금지**
   - `lib/notion.ts`의 `validateAccessToken()`, `isInvoiceValid()` 사용
   - 여러 파일에 검증 로직 중복 금지

6. **`tsconfig.json` 경로 별칭 수정 금지**
   - `@/*`를 `./src/*`로 유지
   - 불필요한 별칭 추가 금지

7. **Server Component에서 `window` 또는 `document` 사용 금지**
   - DOM API 접근 필요 시 `"use client"` 추가
   - Server Component는 브라우저 전역 변수 접근 불가

8. **Tailwind 유틸리티를 스킵하고 인라인 CSS 사용 금지**
   - `className`에 Tailwind 유틸리티만 사용
   - `style={}` 속성 추가 금지 (불가피한 경우 제외)

9. **여러 `<Toaster />` 인스턴스 생성 금지**
   - `src/app/layout.tsx`에서만 1개

10. **`.env.local` 또는 `.env.*.local` 파일 커밋 금지**
    - `.gitignore`에 추가

---

## 오류 처리 및 엣지 케이스

### 견적서 접근 오류 코드

**`/denied`로 리디렉션할 때 다음 reason 코드 사용:**

| 코드 | 의미 | 처리 |
|------|------|------|
| `TOKEN_INVALID` | 토큰 누락 또는 불일치 | Proxy 또는 페이지 검증 실패 |
| `TOKEN_EXPIRED` | 견적서 만기일 지남 | 견적서 유효성 만료 |
| `INVOICE_NOT_FOUND` | Notion에 존재하지 않는 ID | 404 오류 |
| `SERVER_ERROR` | Notion API 실패 또는 기타 오류 | 500 오류 |

**예시:**
```tsx
if (!invoice) {
  redirect("/denied?reason=INVOICE_NOT_FOUND");
}

if (!validateAccessToken(invoice, token)) {
  redirect("/denied?reason=TOKEN_INVALID");
}

if (!isInvoiceValid(invoice)) {
  redirect("/denied?reason=TOKEN_EXPIRED");
}
```

### Notion API 오류

- **`getInvoice()`에서 오류 catch** — null 반환
- **콘솔에 오류 로깅** — 디버깅용
- **API 실패 시 `/denied?reason=SERVER_ERROR`로 리디렉션**
- **예시:**
  ```tsx
  try {
    const response = await notion.databases.query({ ... });
    // 응답 파싱...
  } catch (error) {
    console.error("[Notion API 오류]", error);
    return null;
  }
  ```

### 캐시 무효화

- **`getInvoice()`는 60초 캐시 적용** (Next.js `unstable_cache` 사용)
- **캐시 초기화:** 현재는 수동 (캐시 초기화 엔드포인트 없음)
- **테스트 시:** 필요하면 `src/lib/notion.ts`의 캐시 시간 조정

---

## AI 의사결정 가이드라인

### 명확화가 필요한 경우

- ❓ **기능 범위 불명확:** "PDF에 회사 로고 포함? 견적서 정보만?"
- ❓ **여러 가능한 방식:** "NavBar에 테마 토글 추가? 설정 페이지 생성?"
- ❓ **주요 변경:** "invoice.accessToken을 invoice.token으로 이름 변경? (proxy.ts, schemas.ts 등 영향)"

### 확인 없이 진행 가능

- ✅ **버그 수정:** 타이포 수정, 로직 오류 수정, 테스트 수정
- ✅ **shadcn/ui 컴포넌트 추가:** 사전 설치된 버전 사용
- ✅ **파일 내 리팩토링:** 코드 재구성, 가독성 개선 (다중 파일 변경 없음)
- ✅ **기존 패턴 따르기:** `src/app/invoice/[id]/page.tsx` 패턴으로 새 페이지 추가

### 코드 변경 우선순위

1. **기능성**: 의도한 대로 작동하는가?
2. **타입 안전성**: 모든 타입이 정확하고 추론되는가?
3. **검증**: 신뢰할 수 없는 모든 입력이 검증되는가?
4. **스타일**: 프로젝트 규칙 준수 (2칸, 네이밍, 주석)?
5. **최적화**: 더 빠르거나 깨끗할 수 있는가? (주요 변경 금지)

### 아키텍처 결정 체크리스트

기능 구현 위치 결정 시:

- [ ] **Server vs Client?** — 상호작용 필요 없으면 Server Component 사용
- [ ] **데이터 출처는?** — Notion API → 서버만, localStorage → 클라이언트 Context, props → 어디든
- [ ] **보호된 라우트?** — 그렇다면 `proxy.ts` matcher에 추가
- [ ] **검증 필요?** — 외부 데이터 처리 시 Zod 스키마 추가
- [ ] **관련 파일은?** — 모든 관련 파일 동시에 업데이트 (types, schemas, lib, components)

---

## 프로젝트 진행 추적

### 완료됨 (Day 1)
- ✅ TypeScript 타입 (src/types/invoice.ts)
- ✅ Zod 스키마 (src/lib/schemas.ts)
- ✅ Notion API 클라이언트 + 캐싱 (src/lib/notion.ts)
- ✅ Proxy 접근 제어 (src/proxy.ts)
- ✅ 접근 거부 페이지 (src/app/denied/page.tsx)
- ✅ 견적서 뷰 페이지 구조 (src/app/invoice/[id]/page.tsx)
- ✅ 환경변수 템플릿 (.env.example)

### 진행 중
- 🔄 견적서 뷰 UI 컴포넌트 (InvoiceHeader, InvoiceItemsTable, InvoiceSummary)
- 🔄 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 🔄 인쇄 CSS 최적화

### TODO (향후)
- ⏳ PDF 다운로드 버튼 + @react-pdf/renderer 또는 html2canvas 통합
- ⏳ 이메일 기반 견적서 공유
- ⏳ 견적서 상태 추적 (draft/sent/accepted)
- ⏳ 분석 및 로깅

---

## 빠른 참조: 일반적인 작업

### Notion 필드를 Invoice에 추가

1. `src/types/invoice.ts` 업데이트 — 속성 추가
2. `src/lib/schemas.ts` 업데이트 — Zod 필드 + 검증 추가
3. `src/lib/notion.ts` 업데이트 — Notion 응답에서 추출
4. 컴포넌트에서 사용

### 새로운 보호 페이지 생성

1. `src/app/...`에 파일 생성 (params/searchParams Promise 타입)
2. `src/proxy.ts` config.matcher에 라우트 추가
3. 페이지에 토큰 검증 구현
4. `/denied?reason=...`로 리디렉션 처리

### 테마 색상 변경

1. `src/app/globals.css`의 `:root`와 `.dark` 편집
2. Tailwind 클래스 또는 CSS 변수로 새 색상 사용
3. 라이트와 다크 모드에서 테스트

### 토스트 알림 추가

1. 임포트: `import { toast } from "sonner";`
2. 사용: `toast.success("메시지");` 또는 `toast.error()`, `toast.info()`
3. Toaster 컴포넌트는 이미 RootLayout에 포함

---

## 파일 상호작용 맵

**핵심 파일 및 의존성:**

```
src/proxy.ts
  ↓ (토큰 파라미터 확인)
src/app/invoice/[id]/page.tsx
  ↓ (getInvoice & 검증 함수 호출)
src/lib/notion.ts
  ↓ (Zod로 응답 검증)
src/lib/schemas.ts
  ↓ (타입 추론 & Notion 데이터 파싱)
src/types/invoice.ts (Invoice 인터페이스)

src/app/layout.tsx
  ↓ (테마 & 토스터 제공)
src/contexts/ThemeContext.tsx
  ↓ (localStorage, DOM 관리)
src/app/globals.css (CSS 변수)

src/components/ui/ & src/components/layout/
  ↓ (Tailwind + CSS 변수로 스타일링)
shadcn/ui 컴포넌트
```

---

**최종 업데이트:** 2026년 3월 23일
