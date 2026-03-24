# HomePage

> 스타터킷의 메인 랜딩 페이지. 프로젝트 소개, 기술 스택, 주요 기능, 빠른 시작 가이드를 제공합니다.

## 개요

`src/app/page.tsx`는 루트 경로(`/`)에 접근할 때 표시되는 홈 페이지입니다.
서버 컴포넌트(Server Component)로 동작하며, 사용자 인터랙션 없이 정적인 랜딩 페이지를 렌더링합니다.
방문자에게 스타터킷의 목적과 주요 기능을 소개하고, 컴포넌트/API 문서 페이지로 유도합니다.

## 사용 방법

이 파일은 Next.js App Router에 의해 `/` 경로에 자동 매핑됩니다.
별도로 import할 필요 없이 루트 URL에 접속하면 렌더링됩니다.

## 페이지 섹션 구조

| 섹션 | 역할 | 주요 컴포넌트 |
|------|------|--------------|
| Hero | 프로젝트 소개 + CTA 버튼 | Badge, Button, Link |
| 기술 스택 | 사용 기술 배지 목록 | div (커스텀 배지) |
| 주요 기능 | 6가지 핵심 기능 카드 그리드 | Card, Badge, Lucide 아이콘 |
| 빠른 시작 | 3단계 설치 가이드 | Card, code |
| CTA | 페이지 하단 재유도 버튼 | Button, Link |

## 주요 데이터 구조

### features 배열

```tsx
const features = [
  {
    icon: Code2,          // Lucide 아이콘 컴포넌트
    title: "최신 기술 스택",
    description: "...",
    badge: "Next.js 16",  // 카드 우측 상단 배지 텍스트
  },
  // ... 총 6개 항목
];
```

새로운 기능 카드를 추가하려면 이 배열에 항목을 추가하세요. 그리드가 자동으로 확장됩니다.

### techStack 배열

```tsx
const techStack = [
  {
    name: "Next.js",
    version: "16.1.6",
    color: "bg-black text-white dark:bg-white dark:text-black",  // 다크모드 대응 색상
  },
  // ... 총 6개 항목
];
```

## 주요 로직 설명

### 아이콘 동적 렌더링

```tsx
{features.map((feature) => {
  const Icon = feature.icon;  // Lucide 아이콘을 변수에 할당
  return <Icon className="h-5 w-5 text-primary" />;
})}
```

Lucide 아이콘 컴포넌트를 데이터 배열에 직접 저장하고, 렌더링 시 변수로 받아서 JSX 태그로 사용합니다.
컴포넌트 참조를 소문자 변수에 담으면 JSX가 HTML 태그로 인식하므로 반드시 대문자(PascalCase) 변수명을 사용해야 합니다.

### 반응형 그리드

```tsx
// 모바일 1열 → 태블릿 2열 → 데스크톱 3열
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

Tailwind CSS의 반응형 접두사를 사용해 화면 크기에 따라 열 수를 자동 조정합니다.

### 배경 장식 처리

```tsx
<div aria-hidden="true">
  <div className="... blur-3xl" />
</div>
```

배경의 원형 블러 효과는 순수 시각적 장식이므로 `aria-hidden="true"`로 스크린리더가 무시하도록 처리합니다.
`pointer-events-none`으로 마우스 이벤트도 차단합니다.

## 접근성 처리

- `aria-labelledby`: 각 section을 관련 h2 제목과 연결합니다.
- `aria-hidden="true"`: 장식용 배경 요소를 스크린리더가 무시하도록 처리합니다.

```tsx
<section aria-labelledby="features-title">
  <h2 id="features-title">주요 기능</h2>
</section>
```

## 관련 파일

- [`src/app/layout.tsx`](../layout.tsx) — 이 페이지를 감싸는 루트 레이아웃
- [`src/app/components/page.tsx`](../components/page.tsx) — CTA 버튼이 연결하는 컴포넌트 쇼케이스 페이지
- [`src/app/api-docs/page.tsx`](../api-docs/page.tsx) — CTA 버튼이 연결하는 API 문서 페이지

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-09 | 한국어 주석 및 문서 추가 |
| 2026-03-09 | 최초 생성 |
