/**
 * InvoiceActions 클라이언트 컴포넌트
 *
 * PDF 다운로드 및 인쇄 버튼을 제공합니다.
 * window.print()를 사용하므로 "use client" 디렉티브가 필요합니다.
 * 인쇄 시 print:hidden 클래스로 화면에서 숨깁니다.
 */

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/types/invoice";

/**
 * PdfDownloadButton을 동적 import로 지연 로딩
 * - ssr: false → 서버 사이드 렌더링 제외 (클라이언트 전용)
 * - loading → 번들 로드 전 표시할 폴백 버튼
 * 초기 페이지 로드 시 pdf-canvas 관련 번들이 포함되지 않도록 분리합니다.
 */
const PdfDownloadButton = dynamic(
  () =>
    import("@/components/invoice/PdfDownloadButton").then(
      (m) => m.PdfDownloadButton
    ),
  {
    ssr: false,
    loading: () => (
      <Button variant="default" size="default" disabled aria-label="PDF 준비 중">
        <Download className="w-4 h-4" />
        PDF 준비 중...
      </Button>
    ),
  }
);

interface InvoiceActionsProps {
  /** 견적서 전체 객체 (PDF 생성에 필요) */
  invoice: Invoice;
}

export default function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  /** 인쇄 다이얼로그 실행 */
  const handlePrint = () => {
    setIsPrinting(true);
    // 약간의 딜레이 후 인쇄 (상태 업데이트 반영 대기)
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    // 인쇄 시 숨김 처리
    <div className="flex justify-end gap-3 mb-6 print:hidden">
      {/* PDF 다운로드 버튼 */}
      <PdfDownloadButton invoice={invoice} />

      {/* 인쇄 버튼 */}
      <Button
        variant="outline"
        size="default"
        onClick={handlePrint}
        disabled={isPrinting}
        aria-label="견적서 인쇄"
      >
        <Printer className="w-4 h-4" />
        {isPrinting ? "인쇄 중..." : "인쇄"}
      </Button>
    </div>
  );
}
