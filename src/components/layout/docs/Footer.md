# Footer

> 모든 페이지 하단에 표시되는 글로벌 푸터. GitHub 링크, 기술 스택 아이콘, 저작권 정보를 제공합니다.

## 개요

`src/components/layout/Footer.tsx`는 `RootLayout`에 한 번 배치되어 앱 전체에 적용되는 공통 하단 영역입니다.
프로젝트의 GitHub 저장소 링크와 사용된 기술 스택(React, Next.js, Tailwind CSS, shadcn/ui, Lucide)의 공식 사이트로 이동하는 아이콘 링크를 제공합니다.
기술 아이콘은 Lucide React에 포함되지 않은 프레임워크 로고를 인라인 SVG로 직접 구현했습니다.

## 사용 방법

`layout.tsx`에서 전역으로 한 번만 배치합니다.

```tsx
// src/app/layout.tsx
import Footer from "@/components/layout/Footer";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

## Props / 파라미터

Footer는 Props를 받지 않습니다. 모든 데이터(링크 목록, GitHub URL)가 컴포넌트 내부에 정의되어 있습니다.

## 내부 데이터

### frameworkLinks 배열

```tsx
const frameworkLinks = [
  { label: "React.js", href: "https://react.dev", icon: <ReactIcon /> },
  { label: "Next.js", href: "https://nextjs.org", icon: <NextjsIcon /> },
  { label: "Tailwind CSS", href: "https://tailwindcss.com", icon: <TailwindIcon /> },
  { label: "shadcn/ui", href: "https://ui.shadcn.com", icon: <ShadcnIcon /> },
  { label: "Lucide React", href: "https://lucide.dev", icon: <LucideIcon /> },
];
```

새 기술을 추가하려면 SVG 아이콘 컴포넌트를 만들고 이 배열에 항목을 추가하세요.

### GIT_REPO_URL 상수

```tsx
const GIT_REPO_URL = "https://github.com/mylko72/my-nextjs-starterkit";
```

GitHub 저장소 URL을 상수로 분리해 관리합니다. 저장소가 변경될 때 이 값만 수정하면 됩니다.

## 인라인 SVG 아이콘 컴포넌트

| 컴포넌트명 | 대상 기술 | 특징 |
|------------|-----------|------|
| `ReactIcon` | React.js | 원자(atom) 형태의 공식 로고 |
| `NextjsIcon` | Next.js | N 형태의 원형 로고 |
| `TailwindIcon` | Tailwind CSS | 파도(wave) 형태의 로고 |
| `ShadcnIcon` | shadcn/ui | 두 대각선 라인 로고 |
| `LucideIcon` | Lucide React | 원형 호(arc) 로고 |

모든 아이콘에 `aria-hidden="true"`를 적용해 스크린리더가 장식 이미지를 무시하도록 합니다.
각 링크의 `aria-label`에 기술 이름을 포함해 스크린리더 사용자도 목적지를 알 수 있습니다.

## 주요 로직 설명

### 툴팁 구현

```tsx
<div className="relative group">
  <Link href={link.href}>
    {link.icon}
  </Link>
  <span className="absolute ... opacity-0 group-hover:opacity-100 transition-opacity">
    {link.label}
  </span>
</div>
```

부모에 `group` 클래스를 지정하고, 자식 span에 `group-hover:opacity-100`을 적용합니다.
부모 hover 시 자식 span이 투명에서 불투명으로 페이드인 되는 Tailwind CSS 패턴입니다.
`pointer-events-none`으로 툴팁 자체가 마우스 이벤트를 방해하지 않도록 합니다.

### 저작권 연도 자동 갱신

```tsx
© {new Date().getFullYear()} Frontend Starter Kit. All rights reserved.
```

`new Date().getFullYear()`는 서버 렌더링 시 현재 연도를 동적으로 계산합니다.
매년 코드를 수동으로 변경하지 않아도 자동으로 최신 연도가 표시됩니다.

### 외부 링크 보안 처리

```tsx
<Link target="_blank" rel="noopener noreferrer">
```

- `target="_blank"`: 새 탭에서 열립니다.
- `rel="noopener noreferrer"`: 탭 나인킹(tab napping) 보안 취약점을 방지합니다. 외부 사이트가 `window.opener`로 원래 탭을 제어하지 못하도록 차단합니다.

## 레이아웃 구조

```
footer
  └─ div.container
       ├─ div.flex (상단 영역)
       │    ├─ Link (GitHub 저장소) ← 좌측
       │    └─ nav (기술 스택 아이콘 목록) ← 우측
       └─ div (저작권 정보) ← 하단 구분선 아래
```

## 관련 파일

- [`src/app/layout.tsx`](../../app/layout.tsx) — Footer가 배치되는 루트 레이아웃

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-09 | 한국어 주석 및 문서 추가 |
| 2026-03-09 | 최초 생성 |
