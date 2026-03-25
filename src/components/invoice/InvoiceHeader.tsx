/**
 * InvoiceHeader 컴포넌트
 *
 * 견적서 상단 헤더 영역을 표시합니다.
 * - 좌측: 발급사 정보 (회사명)
 * - 우측: "견 적 서" 제목, 견적서 번호, 발행일, 만기일, 상태 뱃지
 */

import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { formatDateShort } from "@/utils/format";
import type { Invoice } from "@/types/invoice";

interface InvoiceHeaderProps {
  invoice: Invoice;
}

export default function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-foreground mb-3 tracking-widest">견 적 서</h2>
      <div className="flex justify-center items-center gap-4 flex-wrap text-sm text-muted-foreground">
        <p>
          No. <span className="font-medium text-foreground">{invoice.invoiceNumber}</span>
        </p>
        <p>
          발행일: <span className="text-foreground">{formatDateShort(invoice.issueDate)}</span>
        </p>
        <p>
          만기일: <span className="text-foreground">{formatDateShort(invoice.dueDate)}</span>
        </p>
      </div>
      <div className="flex justify-center pt-2">
        <InvoiceStatusBadge status={invoice.status} />
      </div>
    </div>
  );
}
