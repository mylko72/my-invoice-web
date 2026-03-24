# RootLayout

> Next.js App Router의 최상위 레이아웃. 모든 페이지에 공통 구조(헤더, 푸터, 테마)를 적용합니다.

## 개요

`src/app/layout.tsx`는 Next.js App Router에서 필수적으로 존재해야 하는 루트 레이아웃 파일입니다.
이 파일에 선언된 내용은 앱의 모든 페이지에 자동으로 적용됩니다.
전역 폰트 설정, 다크/라이트 테마 시스템, 공통 NavBar/Footer, 토스트 알림, 접근성 스킵 링크를 한 곳에서 관리합니다.

## 사용 방법

이 파일은 Next.js가 자동으로 사용하므로 직접 임포트할 필요가 없습니다.
페이지를 추가하려면 `src/app/` 하위에 `page.tsx` 파일을 생성하면 자동으로 이 레이아웃 안에 렌더링됩니다.

```tsx
// src/app/about/page.tsx — 이 파일은 자동으로 RootLayout 안에 감싸집니다.
export default function AboutPage() {
  return <div>소개 페이지</div>;
}
```

## Props / 파라미터

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| children | React.ReactNode | ✅ | - | 각 라우트의 page.tsx 컴포넌트. Next.js가 자동으로 주입합니다. |

## 주요 구성 요소

### 폰트 설정

| 변수명 | 폰트 | 용도 |
|--------|------|------|
| `--font-geist-sans` | Geist Sans | 본문 텍스트용 산세리프 폰트 |
| `--font-geist-mono` | Geist Mono | 코드 블록용 고정폭 폰트 |

### 전역 메타데이터

```tsx
export const metadata: Metadata = {
  title: "Frontend Starter Kit",
  description: "React + Next.js + TailwindCSS + shadcn/ui 기반 프론트엔드 스타터킷",
};
```

브라우저 탭 제목과 검색엔진(SEO) 설명으로 사용됩니다.
각 페이지에서 `export const metadata`를 선언하면 페이지별 메타데이터로 덮어쓸 수 있습니다.

### html 속성

```tsx
<html lang="ko" suppressHydrationWarning>
```

- `lang="ko"`: 스크린리더와 검색엔진이 한국어 페이지임을 인식합니다.
- `suppressHydrationWarning`: 다크모드 테마 전환 시 서버/클라이언트 렌더링 불일치 경고를 억제합니다.

### 스킵 네비게이션 링크

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  본문으로 바로가기
</a>
```

키보드 Tab 키를 누를 때만 화면에 나타나는 접근성 링크입니다.
스크린리더나 키보드 사용자가 반복적인 네비게이션 메뉴를 건너뛰고 본문으로 바로 이동할 수 있습니다.

### 컴포넌트 렌더링 순서

```
ThemeProvider
  └─ NavBar          ← 상단 고정 헤더
  └─ main#main-content
       └─ {children} ← 각 페이지 내용
  └─ Footer          ← 하단 푸터
  └─ Toaster         ← 전역 토스트 알림
```

## 주요 로직 설명

### ThemeProvider 적용 방식

`ThemeProvider`는 Context API를 기반으로 하위 모든 컴포넌트에 `theme`(현재 테마)과 `toggleTheme`(전환 함수)을 전달합니다.
하위 컴포넌트에서는 `useTheme()` 훅으로 간단하게 접근할 수 있습니다.

```tsx
// 하위 컴포넌트에서의 사용 예
import { useTheme } from "@/contexts/ThemeContext";

const { theme, toggleTheme } = useTheme();
```

### Toaster 설정

```tsx
<Toaster position="bottom-right" richColors />
```

- `position="bottom-right"`: 화면 우측 하단에 고정 표시
- `richColors`: 토스트 유형(success/error/warning/info)별로 고유 색상 적용

## 관련 파일

- [`src/contexts/ThemeContext.tsx`](../../contexts/ThemeContext.tsx) — 다크/라이트 테마 Context 정의
- [`src/components/layout/NavBar.tsx`](../../components/layout/NavBar.tsx) — 상단 네비게이션 바
- [`src/components/layout/Footer.tsx`](../../components/layout/Footer.tsx) — 하단 푸터
- [`src/app/globals.css`](../globals.css) — 전역 CSS 변수 및 기본 스타일

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-09 | 한국어 주석 및 문서 추가 |
| 2026-03-09 | 최초 생성 |
