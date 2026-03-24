/**
 * 견적서 API Route Handler
 *
 * GET /api/invoice/[id]?token=[accessToken]
 *
 * 토큰을 검증하고 견적서 데이터를 반환합니다.
 * Notion API 키는 이 서버 사이드 코드에서만 사용됩니다.
 *
 * 응답 코드:
 * - 200: 견적서 조회 성공
 * - 400: token 파라미터 누락
 * - 401: 토큰 불일치 (접근 거부)
 * - 404: 존재하지 않는 견적서
 * - 410: 만기된 견적서
 * - 500: 서버 내부 오류
 */

import { NextRequest, NextResponse } from "next/server";
import { getInvoice, validateAccessToken, isInvoiceValid } from "@/lib/notion";
import type { InvoiceApiResponse } from "@/types/invoice";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<InvoiceApiResponse>> {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token");

  // 1. 토큰 파라미터 필수 체크
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "TOKEN_INVALID",
        message: "접근 토큰이 필요합니다.",
      },
      { status: 400 }
    );
  }

  try {
    // 2. Notion에서 견적서 조회 (캐시 적용)
    const invoice = await getInvoice(id);

    // 3. 견적서 존재 여부 확인
    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: "INVOICE_NOT_FOUND",
          message: "존재하지 않는 견적서입니다.",
        },
        { status: 404 }
      );
    }

    // 4. 토큰 유효성 검증 (서버 사이드에서만 수행)
    if (!validateAccessToken(invoice, token)) {
      return NextResponse.json(
        {
          success: false,
          error: "TOKEN_INVALID",
          message: "유효하지 않은 접근 토큰입니다.",
        },
        { status: 401 }
      );
    }

    // 5. 만기일 확인
    if (!isInvoiceValid(invoice)) {
      return NextResponse.json(
        {
          success: false,
          error: "TOKEN_EXPIRED",
          message: "만기된 견적서입니다. 담당자에게 문의하세요.",
        },
        { status: 410 }
      );
    }

    // 6. 성공 응답 (accessToken은 응답에서 제거 — 클라이언트에 토큰 노출 방지)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken, ...safeInvoice } = invoice;
    return NextResponse.json(
      {
        success: true,
        data: safeInvoice as typeof invoice,
      },
      {
        status: 200,
        headers: {
          // 브라우저 캐시 방지 (매 요청마다 서버에서 검증)
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(`[API 오류] /api/invoice/${id}`, error);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
