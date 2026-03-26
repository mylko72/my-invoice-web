/**
 * Next.js Proxy (구 middleware) -- 견적서 접근 제어
 *
 * Next.js 16부터 middleware.ts 대신 proxy.ts를 사용합니다.
 *
 * /invoice/[id] 경로에 대한 기본 접근 제어를 수행합니다:
 * - MVP 단계에서는 token 파라미터가 없어도 통과 (ID 기반 접근 제어)
 * - 실제 검증(accessToken 필드 확인, 만기일 등)은 page.tsx에서 수행
 *
 * 주의: 토큰의 실제 유효성 검증(Notion DB 대조)은 이 proxy에서 수행하지 않습니다.
 * Proxy는 Edge Runtime에서 동작하므로 Notion API 직접 호출을 피합니다.
 * 실제 검증은 견적서 뷰 페이지의 Server Component 또는 Route Handler에서 수행합니다.
 *
 * 미들웨어 실행 순서:
 * 1. /invoice/[id] 요청 수신
 * 2. 경로 유효성만 확인 (실제 검증은 page.tsx에서)
 * 3. 요청 통과
 */

import { NextRequest, NextResponse } from "next/server";

// Next.js 16: proxy 파일에서는 "proxy" 또는 default로 함수를 내보내야 합니다.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /invoice/[id] 경로만 처리
  // MVP 단계에서는 기본적으로 모든 요청을 통과시키고,
  // 실제 검증(accessToken 필드 확인, 만기일 등)은 page.tsx에서 수행합니다.
  if (pathname.startsWith("/invoice/")) {
    // 향후 추가 검증 필요 시 이 부분에서 구현
    // 예: 봇 탐지, rate limiting 등
  }

  // 요청 통과 (실제 검증은 page.tsx에서 수행)
  return NextResponse.next();
}

/**
 * Proxy 실행 범위 설정
 * /invoice/ 하위 경로에만 실행됩니다.
 */
export const config = {
  matcher: [
    "/invoice/:path*",
  ],
};
