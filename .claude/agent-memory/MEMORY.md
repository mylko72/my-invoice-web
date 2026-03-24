# 프로젝트 메모리 - Frontend Starter Kit

## 프로젝트 개요
- Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui 기반 스타터킷
- 경로: `C:\my_workroom\claude-nextjs-starterkits`

## 아키텍처 패턴
- 커스텀 ThemeContext (`src/contexts/ThemeContext.tsx`) 사용 → next-themes 미사용
- sonner.tsx는 next-themes의 `useTheme`을 import하지만 ThemeProvider가 없어 항상 "system"을 반환
- 레이아웃: `layout.tsx` → ThemeProvider → NavBar / main / Footer / Toaster
- 페이지: `src/app/page.tsx`, `src/app/components/page.tsx`, `src/app/api-docs/page.tsx`

## 주요 이슈 (확인된 버그)
1. **sonner.tsx 테마 충돌**: `useTheme`을 `next-themes`에서 import하나 next-themes ThemeProvider가 없음 → theme 항상 "system"
2. **TableBody 내 Dialog 중첩**: `<TableBody>` 직접 자식으로 `<Dialog>`가 위치 → 유효하지 않은 HTML DOM 구조
3. **applyTheme 의존성 배열 누락**: ThemeContext useEffect에서 applyTheme 참조하나 의존성 배열에 없음 (단, applyTheme이 순수함수라 실질적 버그는 아님)

## 코드 스타일 규칙
- 들여쓰기: 2칸 (준수)
- 컴포넌트: PascalCase (준수)
- 변수/함수: camelCase (준수)
- 주석: 한국어 (준수)
- Tailwind CSS v4 사용 (globals.css에서 @import "tailwindcss")

## 컴포넌트 패턴
- shadcn/ui 컴포넌트는 Radix UI primitives 래핑 (`radix-ui` 패키지 직접 import)
- `cn()` 유틸리티로 클래스 병합 (clsx + tailwind-merge)
- `data-slot` 속성으로 컴포넌트 식별
- CardTitle / CardDescription 모두 `<div>` 태그 사용 (heading 태그 아님)

## 접근성 이슈 패턴
- TableHead에 `scope="col"` 누락 (table.tsx)
- Footer SVG 아이콘에 `aria-hidden` 누락 (Footer.tsx의 frameworkLinks)
- section 요소에 aria-label/aria-labelledby 미사용
- Select 컴포넌트의 Label에 htmlFor 연결 누락 (직업 필드)

## 코드 일관성 이슈
- api-docs/page.tsx: raw `<table>` 태그 사용 (shadcn Table 컴포넌트 미사용)
- components/page.tsx: shadcn `<Label>` 사용, api-docs내 Dialog에서 native `<label>` 혼용
- CodeBlock 컴포넌트가 두 페이지에서 중복 정의 (components/page.tsx, api-docs/page.tsx)

## 성능/UX 이슈
- NavBar: 모바일 메뉴 외부 클릭 닫기 미구현 (useEffect + 이벤트 리스너 필요)
- Footer의 new Date().getFullYear() → 매 렌더마다 호출되나 Server Component라 성능 영향 없음

## 타입 안전성
- getStatusVariant 반환 타입이 badge의 "ghost", "link" variant 미커버 (실용적으로는 문제없음)
- apiDocs.ts: ApiProperty.required가 스키마 레벨이 아닌 프로퍼티 레벨에 위치 (OpenAPI 스펙과 다름)
- tableData의 타입이 인라인 객체 리터럴로만 추론됨 (명시적 타입 선언 없음)
