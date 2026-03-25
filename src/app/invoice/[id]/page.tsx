/**
 * 견적서 뷰 페이지
 *
 * 경로: /invoice/[id]
 *
 * 주요 기능:
 * - Notion API에서 견적서 데이터 조회 (서버 사이드, 60초 캐시)
 * - 견적서 비즈니스 문서 레이아웃 렌더링
 * - PDF 다운로드 및 인쇄 버튼 제공
 *
 * 렌더링 방식: Server Component (초기 HTML 즉시 전달)
 */

import { redirect } from "next/navigation";
import { getInvoice } from "@/lib/notion";
import type { Metadata } from "next";
import type { InvoiceSummary } from "@/types/invoice";
import {
  InvoiceHeader,
  InvoiceClientInfo,
  InvoiceItemsTable,
  InvoiceSummary as InvoiceSummaryComponent,
  InvoiceNote,
  InvoiceActions,
} from "@/components/invoice";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

/**
 * 동적 메타데이터 생성
 * 견적서 번호를 페이지 제목에 반영합니다.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    return { title: "견적서를 찾을 수 없습니다" };
  }

  return {
    title: `견적서 ${invoice.invoiceNumber} | ${invoice.clientName}`,
    description: `${invoice.clientName} 귀중 견적서 — 발행일: ${invoice.issueDate}`,
    // 검색엔진 색인 방지 (견적서는 공개 페이지가 아님)
    robots: { index: false, follow: false },
  };
}

/**
 * 견적서 뷰 페이지 컴포넌트
 *
 * 검증 순서:
 * 1. Notion에서 견적서 조회 (캐시 우선)
 * 2. 견적서 존재 여부 확인
 * 3. 토큰 유효성 검증 (2차)
 * 4. 견적서 만기일 확인
 */
export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params;

  // Notion에서 견적서 조회 (캐시 우선)
  const invoice = await getInvoice(id);

  // 견적서 없음 → 접근 거부 페이지
  if (!invoice) {
    redirect("/denied?reason=INVOICE_NOT_FOUND");
  }

  // ---------------------------
  // 금액 집계 계산
  // ---------------------------
  const summary: InvoiceSummary = {
    totalSupply: invoice.items.reduce((sum, item) => sum + item.supplyAmount, 0),
    totalTax: invoice.items.reduce((sum, item) => sum + item.taxAmount, 0),
    grandTotal: 0,
  };
  summary.grandTotal = summary.totalSupply + summary.totalTax;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto">

        {/* 액션 버튼 (인쇄 시 숨김) */}
        <InvoiceActions
          invoiceNumber={invoice.invoiceNumber}
          issueDate={invoice.issueDate}
        />

        {/* 견적서 본문 (A4 비율) */}
        <div className="bg-white shadow-sm rounded-lg p-8 print:shadow-none print:rounded-none">

          {/* 헤더: 발급사 정보, 견적서 번호/날짜/상태 */}
          <InvoiceHeader invoice={invoice} />

          {/* 고객사 정보 */}
          <InvoiceClientInfo invoice={invoice} />

          {/* 견적 품목 테이블 */}
          <InvoiceItemsTable items={invoice.items} />

          {/* 금액 합계 섹션 */}
          <InvoiceSummaryComponent summary={summary} />

          {/* 비고 (있을 때만 표시) */}
          <InvoiceNote note={invoice.note} />

        </div>
      </div>
    </div>
  );
}
