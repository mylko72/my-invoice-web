/**
 * InvoiceActions 클라이언트 컴포넌트
 *
 * PDF 다운로드 및 인쇄 버튼을 제공합니다.
 * window.print()를 사용하므로 "use client" 디렉티브가 필요합니다.
 * 인쇄 시 print:hidden 클래스로 화면에서 숨깁니다.
 */

"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfDownloadButton } from "@/components/invoice/PdfDownloadButton";
import type { Invoice } from "@/types/invoice";

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
