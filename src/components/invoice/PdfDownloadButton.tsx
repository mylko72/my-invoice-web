"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/types/invoice";

interface PdfDownloadButtonProps {
  invoice: Invoice;
}

export function PdfDownloadButton({ invoice }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // Phase 4-2에서 구현한 PDF 생성 로직 호출
      const { generateInvoicePdf } = await import("@/lib/pdf");
      await generateInvoicePdf(invoice);
      toast.success("PDF가 다운로드되었습니다.");
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      toast.error("PDF 생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="default"
      size="default"
      onClick={handleDownload}
      disabled={isGenerating}
      aria-label="견적서 PDF 다운로드"
    >
      <Download className="w-4 h-4" />
      {isGenerating ? "생성 중..." : "PDF 다운로드"}
    </Button>
  );
}
