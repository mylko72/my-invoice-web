/**
 * Invoice Web MVP — 공통 포맷 유틸리티 함수
 *
 * 견적서 데이터 표시에 필요한 포맷 함수 모음입니다.
 * 서버/클라이언트 양쪽에서 모두 사용 가능합니다.
 */

// ---------------------------
// 날짜 포맷
// ---------------------------

/**
 * 날짜 문자열을 한국어 형식으로 포맷
 * @param dateStr - "YYYY-MM-DD" 형식의 날짜 문자열
 * @returns "2024년 1월 15일" 형식의 문자열
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 날짜 문자열을 짧은 형식으로 포맷
 * @param dateStr - "YYYY-MM-DD" 형식의 날짜 문자열
 * @returns "2024.01.15" 형식의 문자열
 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, ".");
}

// ---------------------------
// 금액 포맷
// ---------------------------

/**
 * 숫자를 천 단위 구분자 포함 금액으로 포맷 (원 단위)
 * @param amount - 금액 (숫자)
 * @returns "1,000,000" 형식의 문자열 (통화 기호 없음)
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

/**
 * 숫자를 한국 원화 통화 형식으로 포맷
 * @param amount - 금액 (숫자)
 * @returns "₩1,000,000" 형식의 문자열
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

// ---------------------------
// PDF 파일명 생성
// ---------------------------

/**
 * 견적서 PDF 파일명 자동 생성
 * PRD F003: 파일명 형식 "견적서_[견적번호]_[발행일].pdf"
 *
 * @param invoiceNumber - 견적서 번호 (예: "2024-001")
 * @param issueDate - 발행일 (예: "2024-01-15")
 * @returns "견적서_2024-001_20240115.pdf" 형식의 파일명
 */
export function generatePdfFileName(invoiceNumber: string, issueDate: string): string {
  // 발행일에서 하이픈 제거 (20240115 형식)
  const dateFormatted = issueDate.replace(/-/g, "");
  return `견적서_${invoiceNumber}_${dateFormatted}.pdf`;
}

// ---------------------------
// 견적서 상태 표시
// ---------------------------

/** 견적서 상태 한국어 레이블 */
const invoiceStatusLabels: Record<string, string> = {
  draft: "초안",
  sent: "발송됨",
  accepted: "수락됨",
};

/**
 * 견적서 상태 코드를 한국어 레이블로 변환
 * @param status - 상태 코드 (draft | sent | accepted)
 */
export function formatInvoiceStatus(status: string): string {
  return invoiceStatusLabels[status] ?? status;
}

// ---------------------------
// 클립보드
// ---------------------------

/**
 * 문자열을 클립보드에 복사
 * @returns 성공 시 true, 실패 시 false
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
