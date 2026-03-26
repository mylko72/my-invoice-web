/**
 * Next.js Proxy (구 middleware) -- 견적서 접근 제어
 *
 * Next.js 16부터 middleware.ts 대신 proxy.ts를 사용합니다.
 *
 * /invoice/[id] 경로에 접근할 때 token 쿼리 파라미터 존재 여부를 확인합니다.
 * 토큰이 없으면 즉시 접근 거부 페이지로 리디렉션합니다.
 *
 * 주의: 토큰의 실제 유효성 검증(Notion DB 대조)은 이 proxy에서 수행하지 않습니다.
 * Proxy는 Edge Runtime에서 동작하므로 Notion API 직접 호출을 피합니다.
 * 실제 검증은 견적서 뷰 페이지의 Server Component 또는 Route Handler에서 수행합니다.
 *
 * 미들웨어 실행 순서:
 * 1. /invoice/[id] 요청 수신
 * 2. token 파라미터 존재 여부 확인
 * 3. 없으면 → /denied?reason=TOKEN_INVALID 리디렉션
 * 4. 있으면 → 요청 통과 (실제 검증은 페이지에서)
 */

import { NextRequest, NextResponse } from "next/server";

// Next.js 16: proxy 파일에서는 "proxy" 또는 default로 함수를 내보내야 합니다.
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // /invoice/[id] 경로만 검사
  if (pathname.startsWith("/invoice/")) {
    const token = searchParams.get("token");

    // 토큰 파라미터 미존재 → 접근 거부
    if (!token) {
      const deniedUrl = new URL("/denied", request.url);
      deniedUrl.searchParams.set("reason", "TOKEN_INVALID");
      return NextResponse.redirect(deniedUrl);
    }
  }

  // 통과
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
