/**
 * InvoiceStatusBadge 컴포넌트
 *
 * 견적서 상태(draft/sent/accepted)를 색상 뱃지로 표시합니다.
 * shadcn/ui Badge 컴포넌트를 기반으로 상태별 색상을 커스터마이징합니다.
 */

import { Badge } from "@/components/ui/badge";
import { formatInvoiceStatus } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/invoice";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

/**
 * 상태별 Badge 스타일 매핑
 * - draft(초안): 회색 계열 outline
 * - sent(발송됨): 파란색 계열
 * - accepted(수락됨): 초록색 계열
 */
const statusStyleMap: Record<InvoiceStatus, string> = {
  draft: "border-gray-300 text-gray-600 bg-gray-50",
  sent: "border-blue-300 text-blue-700 bg-blue-50",
  accepted: "border-green-300 text-green-700 bg-green-50",
};

export default function InvoiceStatusBadge({
  status,
  className,
}: InvoiceStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyleMap[status], className)}
    >
      {formatInvoiceStatus(status)}
    </Badge>
  );
}
