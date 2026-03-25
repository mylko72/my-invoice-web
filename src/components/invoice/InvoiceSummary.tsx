/**
 * InvoiceSummary 컴포넌트
 *
 * 견적서 금액 합계 섹션을 표시합니다.
 * - 공급가액 합계
 * - 부가세 합계 (10%)
 * - 최종 합계 (볼드 강조)
 *
 * props로 계산된 InvoiceSummary 객체를 받아 렌더링합니다.
 */

import { formatAmount } from "@/utils/format";
import type { InvoiceSummary as InvoiceSummaryType } from "@/types/invoice";

interface InvoiceSummaryProps {
  summary: InvoiceSummaryType;
}

export default function InvoiceSummary({ summary }: InvoiceSummaryProps) {
  const { totalSupply, totalTax, grandTotal } = summary;

  return (
    <div className="flex justify-end mb-6">
      {/* 합계 박스: 우측 정렬, 최소 너비 고정 */}
      <div className="w-64">
        {/* 공급가액 행 */}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-sm text-muted-foreground">공급가액</span>
          <span className="text-sm font-medium text-foreground">
            {formatAmount(totalSupply)} 원
          </span>
        </div>

        {/* 부가세 행 */}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <span className="text-sm text-muted-foreground">부가세 (10%)</span>
          <span className="text-sm font-medium text-foreground">
            {formatAmount(totalTax)} 원
          </span>
        </div>

        {/* 합계 행 — 강조 표시 */}
        <div className="flex justify-between items-center py-3">
          <span className="text-base font-bold text-foreground">합 계</span>
          <span className="text-base font-bold text-foreground">
            {formatAmount(grandTotal)} 원
          </span>
        </div>
      </div>
    </div>
  );
}
