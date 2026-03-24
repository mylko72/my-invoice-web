# NavBar

> 모든 페이지 상단에 고정되는 반응형 글로벌 네비게이션 바 컴포넌트입니다.

## 개요

`src/components/layout/NavBar.tsx`는 `RootLayout`에 한 번 배치되어 앱 전체에 적용되는 공통 헤더입니다.
데스크톱(md 이상)에서는 가로 메뉴로, 모바일(md 미만)에서는 햄버거 버튼을 클릭해 열 수 있는 드롭다운 메뉴로 전환됩니다.
현재 URL 경로를 감지해 활성화된 메뉴 항목을 시각적으로 강조하며, 다크/라이트 모드 전환 버튼을 포함합니다.

## 사용 방법

`layout.tsx`에서 전역으로 한 번만 배치합니다. 직접 페이지에서 사용하지 않습니다.

```tsx
// src/app/layout.tsx
import NavBar from "@/components/layout/NavBar";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

## Props / 파라미터

NavBar는 Props를 받지 않습니다. 필요한 모든 데이터(테마, 현재 경로)를 내부 훅으로 가져옵니다.

## 내부 상태

| 상태 | 타입 | 초기값 | 설명 |
|------|------|--------|------|
| mobileMenuOpen | boolean | false | 모바일 드롭다운 메뉴의 열림/닫힘 상태 |

## 내부 데이터

### navLinks 배열

```tsx
const navLinks = [
  { href: "/", label: "홈" },
  { href: "/components", label: "컴포넌트" },
  { href: "/api-docs", label: "API 문서" },
];
```

새 페이지를 추가할 때 이 배열에 항목을 추가하면 데스크톱/모바일 메뉴 모두에 자동 반영됩니다.

## 주요 로직 설명

### 활성 메뉴 강조

```tsx
const pathname = usePathname();

<Link
  aria-current={pathname === link.href ? "page" : undefined}
  className={pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"}
>
```

`usePathname()`으로 현재 URL 경로를 가져와 navLinks의 href와 비교합니다.
일치하는 항목에 배경 강조 스타일과 `aria-current="page"` 속성을 적용합니다.

### 외부 클릭 감지 (모바일 메뉴 닫기)

```tsx
const navRef = useRef<HTMLElement>(null);

useEffect(() => {
  if (!mobileMenuOpen) return; // 메뉴가 닫혀있으면 리스너 등록 불필요

  const handleClickOutside = (e: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(e.target as Node)) {
      setMobileMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside); // 클린업
}, [mobileMenuOpen]);
```

`mobileMenuOpen`이 true일 때만 전역 mousedown 이벤트를 등록합니다.
클릭된 요소가 nav 영역(`navRef.current`) 밖이라면 메뉴를 닫습니다.
`useEffect`의 클린업 함수에서 리스너를 제거해 메모리 누수를 방지합니다.

### 다크/라이트 모드 토글

```tsx
const { theme, toggleTheme } = useTheme();

<Button onClick={toggleTheme} aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}>
  {theme === "dark" ? <Sun /> : <Moon />}
</Button>
```

`ThemeContext`에서 현재 테마와 전환 함수를 가져옵니다.
아이콘은 현재 테마의 반대 상태(다크 → 태양, 라이트 → 달)로 표시해 다음 동작을 예측하기 쉽게 합니다.

## 반응형 동작

| 화면 크기 | 동작 |
|-----------|------|
| md 미만 (모바일) | 가로 메뉴 숨김, 햄버거 버튼 표시 → 클릭 시 드롭다운 표시 |
| md 이상 (데스크톱) | 가로 메뉴 표시, 햄버거 버튼 숨김 |

## 접근성 처리

| 속성 | 적용 위치 | 목적 |
|------|-----------|------|
| `aria-current="page"` | 현재 페이지 링크 | 스크린리더가 현재 페이지 인식 |
| `aria-label` | 테마 토글 버튼 | 버튼 역할 설명 |
| `aria-expanded` | 모바일 메뉴 버튼 | 메뉴 열림/닫힘 상태 전달 |
| `aria-label="주요 네비게이션"` | 데스크톱 nav | 랜드마크 구분 |
| `aria-label="모바일 네비게이션"` | 모바일 nav | 랜드마크 구분 |

## 관련 파일

- [`src/app/layout.tsx`](../../app/layout.tsx) — NavBar가 배치되는 루트 레이아웃
- [`src/contexts/ThemeContext.tsx`](../../contexts/ThemeContext.tsx) — useTheme 훅을 제공하는 테마 Context

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-09 | 한국어 주석 및 문서 추가 |
| 2026-03-09 | 최초 생성 |
