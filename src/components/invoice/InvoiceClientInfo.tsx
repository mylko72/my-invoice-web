/**
 * InvoiceClientInfo 컴포넌트
 *
 * 고객사 정보를 표시합니다.
 * - 수신: 고객사명 (clientName) — 필수
 * - 담당: 담당자명 (clientContact) — 선택
 */

import type { Invoice } from "@/types/invoice";

interface InvoiceClientInfoProps {
  /** 견적서 데이터 (clientName, clientContact 사용) */
  invoice: Pick<Invoice, "clientName" | "clientContact">;
}

export default function InvoiceClientInfo({ invoice }: InvoiceClientInfoProps) {
  return (
    <div className="border border-border rounded-md p-4 mb-6">
      {/* 고객사명 */}
      <p className="text-sm font-medium text-muted-foreground">
        수신:{" "}
        <span className="text-foreground font-semibold">{invoice.clientName}</span>
      </p>

      {/* 담당자 (있을 때만 표시) */}
      {invoice.clientContact && (
        <p className="text-sm text-muted-foreground mt-1">
          담당:{" "}
          <span className="text-foreground">{invoice.clientContact}</span>
        </p>
      )}
    </div>
  );
}
