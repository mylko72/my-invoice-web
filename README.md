# Invoice Web MVP

Notion에서 관리하는 견적서를 클라이언트가 공유 링크로 조회하고 PDF로 다운로드하는 서비스입니다.

## 기술 스택

| 기술 | 버전 | 설명 |
|------|------|------|
| Next.js | 16.1.6 | React 기반 풀스택 프레임워크 (App Router) |
| React | 19.2.3 | UI 라이브러리 |
| TypeScript | 5 | 정적 타입 언어 |
| Tailwind CSS | v4 | 유틸리티 우선 CSS 프레임워크 |
| shadcn/ui | Latest | 재사용 가능한 UI 컴포넌트 라이브러리 |
| @notionhq/client | Latest | Notion API SDK |
| @react-pdf/renderer | Latest | PDF 생성 라이브러리 |
| Zod | Latest | 데이터 검증 라이브러리 |
| Sonner | Latest | Toast 알림 라이브러리 |
| Lucide React | Latest | 아이콘 라이브러리 |
| next-themes | Latest | 테마 관리 라이브러리 |

## 시작하기

### 필요 조건

- Node.js 18.17 이상
- npm, yarn, pnpm 또는 bun
- Notion Integration Token
- Notion Database ID (견적서 DB)

### 환경 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local

# 다음 환경변수 설정:
# NOTION_API_KEY=          # Notion Integration 시크릿
# NOTION_DATABASE_ID=      # 견적서 Notion DB ID
# NEXT_PUBLIC_APP_URL=     # 배포 URL (예: https://example.com)
# CONTACT_EMAIL=           # 담당자 이메일
```

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 확인
# http://localhost:3000
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드된 앱 실행
npm run start
```

## 프로젝트 구조

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
│
├── components/
│   ├── layout/
│   │   ├── NavBar.tsx          # 네비게이션 바
│   │   └── Footer.tsx          # 푸터
│   └── ui/                    # shadcn/ui 컴포넌트
│
├── contexts/
│   └── ThemeContext.tsx        # 다크/라이트 모드 Context & 훅
│
├── lib/
│   ├── utils.ts                # cn() 함수
│   ├── notion.ts               # Notion API 클라이언트 + 캐싱
│   └── schemas.ts              # Zod 스키마 (Notion 응답 검증)
│
├── types/
│   └── invoice.ts              # Invoice 관련 TypeScript 타입
│
├── utils/
│   └── format.ts              # 포맷 유틸리티 (날짜, 금액, PDF 파일명)
│
└── proxy.ts                    # Next.js 16 Proxy (토큰 접근 제어)
```

## 주요 기능

### 📄 견적서 조회
- Notion DB에서 견적서 정보 조회
- 토큰 기반 접근 제어 (공유 링크 방식)
- 60초 캐싱으로 성능 최적화

### 📋 견적서 뷰
- 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 인쇄 친화적 디자인
- 다크/라이트 모드 지원

### 🎨 다크/라이트 모드

ThemeContext를 통해 테마를 관리합니다.

```tsx
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>테마 토글: {theme}</button>;
}
```

## Notion API 연동

### 기본 사용법

```typescript
import { getInvoice, validateAccessToken, isInvoiceValid } from "@/lib/notion";

// 서버 컴포넌트에서 사용
const invoice = await getInvoice(id);        // 60초 캐시 적용
validateAccessToken(invoice, token);          // 토큰 검증
isInvoiceValid(invoice);                      // 만기일 확인
```

### Notion Database 구조

견적서 DB에 필요한 필드:

- `Name` (제목) — 견적서 번호 또는 제목
- `Client` (텍스트) — 클라이언트 이름
- `Items` (관계) — 품목 데이터베이스와의 관계
- `Amount` (숫자) — 합계 금액
- `Currency` (셀렉트) — 통화 (KRW, USD 등)
- `Status` (셀렉트) — 상태 (Draft, Active, Expired)
- `ExpiryDate` (날짜) — 유효 기간
- `AccessToken` (텍스트) — 공유 토큰

## 개발 명령어

```bash
# Lint 실행
npm run lint

# 새 UI 컴포넌트 추가
/add-component 컴포넌트명

# 커밋 (이모지 & 한국어 메시지)
/git:commit
```

## 배포

### Vercel 배포

```bash
# 1. Vercel에 프로젝트 연결
# 2. 환경변수 설정
#    - NOTION_API_KEY
#    - NOTION_DATABASE_ID
#    - NEXT_PUBLIC_APP_URL
#    - CONTACT_EMAIL

# 3. 배포
git push origin main
```

## 라이선스

MIT

## 라이선스

MIT
