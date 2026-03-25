/**
 * InvoiceActions 클라이언트 컴포넌트
 *
 * PDF 다운로드 및 인쇄 버튼을 제공합니다.
 * window.print()를 사용하므로 "use client" 디렉티브가 필요합니다.
 * 인쇄 시 print:hidden 클래스로 화면에서 숨깁니다.
 *
 * TODO (Day 4): PDF 다운로드 버튼을 @react-pdf/renderer 기반으로 교체
 */

"use client";

import { useState } from "react";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePdfFileName } from "@/utils/format";

interface InvoiceActionsProps {
  /** 견적서 번호 (PDF 파일명 생성에 사용) */
  invoiceNumber: string;
  /** 발행일 (PDF 파일명 생성에 사용) */
  issueDate: string;
}

export default function InvoiceActions({
  invoiceNumber,
  issueDate,
}: InvoiceActionsProps) {
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

  /**
   * PDF 다운로드 처리
   * TODO (Day 4): @react-pdf/renderer 또는 html2canvas + jsPDF로 실제 PDF 생성
   * 현재는 브라우저 인쇄 다이얼로그로 대체 (PDF로 저장 가능)
   */
  const handleDownloadPdf = () => {
    // TODO (Day 4): @react-pdf/renderer로 교체 시 아래 파일명 사용
    // const fileName = generatePdfFileName(invoiceNumber, issueDate);
    // 임시: 인쇄 다이얼로그를 통해 PDF로 저장하도록 안내
    void generatePdfFileName(invoiceNumber, issueDate); // 파일명 생성 로직 유지 (향후 사용)
    window.print();
  };

  return (
    // 인쇄 시 숨김 처리
    <div className="flex justify-end gap-3 mb-6 print:hidden">
      {/* PDF 다운로드 버튼 */}
      <Button
        variant="default"
        size="default"
        onClick={handleDownloadPdf}
        aria-label="견적서 PDF 다운로드"
      >
        <Download />
        PDF 다운로드
      </Button>

      {/* 인쇄 버튼 */}
      <Button
        variant="outline"
        size="default"
        onClick={handlePrint}
        disabled={isPrinting}
        aria-label="견적서 인쇄"
      >
        <Printer />
        {isPrinting ? "인쇄 중..." : "인쇄"}
      </Button>
    </div>
  );
}
