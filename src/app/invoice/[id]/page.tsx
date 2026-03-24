/**
 * 견적서 뷰 페이지
 *
 * 경로: /invoice/[id]?token=[accessToken]
 *
 * 주요 기능:
 * - Notion API에서 견적서 데이터 조회 (서버 사이드, 60초 캐시)
 * - 토큰 재검증 (미들웨어 통과 후 2차 검증)
 * - 견적서 비즈니스 문서 레이아웃 렌더링
 * - PDF 다운로드 및 인쇄 버튼 제공
 *
 * 렌더링 방식: Server Component (초기 HTML 즉시 전달)
 */

import { redirect } from "next/navigation";
import { getInvoice, validateAccessToken, isInvoiceValid } from "@/lib/notion";
import type { Metadata } from "next";

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
 * TODO (Day 2): 실제 견적서 UI 컴포넌트로 교체
 * - InvoiceHeader: 회사 정보, 견적서 번호, 발행일/만기일
 * - InvoiceClientInfo: 고객사명, 담당자
 * - InvoiceItemsTable: 품목 테이블 (품명/수량/단가/공급가액/부가세)
 * - InvoiceSummary: 공급가액 합계, 부가세, 총액
 * - InvoiceNote: 비고
 * - InvoiceActions: PDF 다운로드, 인쇄 버튼
 */
export default async function InvoicePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  // 1. Notion에서 견적서 조회 (캐시 우선)
  const invoice = await getInvoice(id);

  // 2. 견적서 없음 → 접근 거부 페이지
  if (!invoice) {
    redirect("/denied?reason=INVOICE_NOT_FOUND");
  }

  // 3. 토큰 유효성 2차 검증 (미들웨어는 존재 여부만 확인)
  if (!token || !validateAccessToken(invoice, token)) {
    redirect("/denied?reason=TOKEN_INVALID");
  }

  // 4. 만기일 확인
  if (!isInvoiceValid(invoice)) {
    redirect("/denied?reason=TOKEN_EXPIRED");
  }

  // ---------------------------
  // 금액 계산
  // ---------------------------
  const totalSupply = invoice.items.reduce((sum, item) => sum + item.supplyAmount, 0);
  const totalTax = invoice.items.reduce((sum, item) => sum + item.taxAmount, 0);
  const grandTotal = totalSupply + totalTax;

  /** 천 단위 구분자 포맷 (예: 1000000 → "1,000,000") */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ko-KR").format(amount);

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto">

        {/* 액션 버튼 (인쇄 시 숨김) */}
        <div className="flex justify-end gap-3 mb-6 print:hidden">
          {/* TODO (Day 4): PdfDownloadButton 클라이언트 컴포넌트로 교체 */}
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            onClick={() => window.print()}
          >
            PDF 다운로드
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => window.print()}
          >
            인쇄
          </button>
        </div>

        {/* 견적서 본문 (A4 비율) */}
        <div className="bg-white shadow-sm rounded-lg p-8 print:shadow-none print:rounded-none">

          {/* 견적서 헤더 */}
          <div className="flex justify-between items-start mb-8">
            <div>
              {/* TODO: 회사 로고 이미지 (next/image 사용) */}
              <h1 className="text-2xl font-bold text-gray-900">
                {process.env.NEXT_PUBLIC_APP_URL ? "귀사" : "회사명"}
              </h1>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">견 적 서</h2>
              <p className="text-sm text-gray-600">No. {invoice.invoiceNumber}</p>
              <p className="text-sm text-gray-600">발행일: {invoice.issueDate}</p>
              <p className="text-sm text-gray-600">만기일: {invoice.dueDate}</p>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="border border-gray-200 rounded-md p-4 mb-6">
            <p className="text-sm font-medium text-gray-700">
              수신: <span className="text-gray-900">{invoice.clientName}</span>
            </p>
            {invoice.clientContact && (
              <p className="text-sm text-gray-700 mt-1">
                담당: <span className="text-gray-900">{invoice.clientContact}</span>
              </p>
            )}
          </div>

          {/* 견적 항목 테이블 */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700 w-8">No</th>
                  <th className="border border-gray-200 px-3 py-2 text-left font-medium text-gray-700">품명</th>
                  <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-700 w-16">수량</th>
                  <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-700 w-24">단가</th>
                  <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-700 w-24">공급가액</th>
                  <th className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-700 w-24">부가세</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.length > 0 ? (
                  invoice.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="border border-gray-200 px-3 py-2 text-gray-600">{index + 1}</td>
                      <td className="border border-gray-200 px-3 py-2 text-gray-900">{item.name}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-gray-900">{item.quantity}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-gray-900">{formatCurrency(item.supplyAmount)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right text-gray-900">{formatCurrency(item.taxAmount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="border border-gray-200 px-3 py-8 text-center text-gray-400">
                      견적 항목이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 합계 섹션 */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">공급가액</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(totalSupply)} 원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">부가세 (10%)</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(totalTax)} 원</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-base font-bold text-gray-900">합 계</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(grandTotal)} 원</span>
              </div>
            </div>
          </div>

          {/* 비고 */}
          {invoice.note && (
            <div className="border border-gray-200 rounded-md p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">비고</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
