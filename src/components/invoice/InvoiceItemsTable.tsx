/**
 * InvoiceItemsTable 컴포넌트
 *
 * 견적서 품목 테이블을 표시합니다.
 * 컬럼: No / 품명 / 수량 / 단가 / 공급가액 / 부가세
 *
 * 모바일에서는 가로 스크롤이 가능하도록 overflow-x-auto 처리합니다.
 */

import { formatAmount } from "@/utils/format";
import type { InvoiceItem } from "@/types/invoice";

interface InvoiceItemsTableProps {
  /** 견적 품목 목록 */
  items: InvoiceItem[];
}

export default function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted print:bg-gray-50">
            <th className="border border-border px-3 py-2 text-left font-medium text-muted-foreground w-8">
              No
            </th>
            <th className="border border-border px-3 py-2 text-left font-medium text-muted-foreground">
              품명
            </th>
            <th className="border border-border px-3 py-2 text-right font-medium text-muted-foreground w-16">
              수량
            </th>
            <th className="border border-border px-3 py-2 text-right font-medium text-muted-foreground w-28">
              단가
            </th>
            <th className="border border-border px-3 py-2 text-right font-medium text-muted-foreground w-28">
              공급가액
            </th>
            <th className="border border-border px-3 py-2 text-right font-medium text-muted-foreground w-28">
              부가세
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                {/* 순번 */}
                <td className="border border-border px-3 py-2 text-muted-foreground text-center">
                  {index + 1}
                </td>
                {/* 품명 */}
                <td className="border border-border px-3 py-2 text-foreground">
                  {item.name}
                </td>
                {/* 수량 */}
                <td className="border border-border px-3 py-2 text-right text-foreground">
                  {item.quantity.toLocaleString("ko-KR")}
                </td>
                {/* 단가 */}
                <td className="border border-border px-3 py-2 text-right text-foreground">
                  {formatAmount(item.unitPrice)}
                </td>
                {/* 공급가액 */}
                <td className="border border-border px-3 py-2 text-right text-foreground">
                  {formatAmount(item.supplyAmount)}
                </td>
                {/* 부가세 */}
                <td className="border border-border px-3 py-2 text-right text-foreground">
                  {formatAmount(item.taxAmount)}
                </td>
              </tr>
            ))
          ) : (
            /* 품목이 없을 때 빈 상태 메시지 */
            <tr>
              <td
                colSpan={6}
                className="border border-border px-3 py-8 text-center text-muted-foreground"
              >
                견적 항목이 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
