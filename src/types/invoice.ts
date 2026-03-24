/**
 * Invoice Web MVP — 타입 정의
 *
 * Notion 데이터베이스 스키마를 기반으로 한 견적서 관련 타입 모음입니다.
 * Zod 스키마에서 추론된 타입은 src/lib/schemas.ts를 참조하세요.
 */

// ---------------------------
// 견적서 상태 (Enum)
// ---------------------------

/** 견적서 진행 상태 */
export type InvoiceStatus = "draft" | "sent" | "accepted";

// ---------------------------
// 견적 항목
// ---------------------------

/** 견적서 내 개별 품목/서비스 항목 */
export interface InvoiceItem {
  /** 항목 식별자 */
  id: string;
  /** 소속 견적서 ID (Invoice.id) */
  invoiceId: string;
  /** 품명 또는 서비스명 */
  name: string;
  /** 수량 */
  quantity: number;
  /** 단가 (원) */
  unitPrice: number;
  /** 공급가액 = 수량 × 단가 */
  supplyAmount: number;
  /** 부가세 = 공급가액 × 10% */
  taxAmount: number;
}

// ---------------------------
// 견적서 (메인 엔티티)
// ---------------------------

/** Notion 데이터베이스에서 읽어온 견적서 전체 데이터 */
export interface Invoice {
  /** Notion 페이지 ID (UUID) */
  id: string;
  /** 견적서 번호 (예: 2024-001) */
  invoiceNumber: string;
  /** 고객사명 */
  clientName: string;
  /** 고객 담당자명 */
  clientContact: string;
  /** 발행일 */
  issueDate: string;
  /** 만기일 */
  dueDate: string;
  /** 견적서 상태 */
  status: InvoiceStatus;
  /** 비고/메모 */
  note: string;
  /** URL 공유용 접근 토큰 (UUID v4) */
  accessToken: string;
  /** 견적 항목 목록 */
  items: InvoiceItem[];
}

// ---------------------------
// 견적서 집계 (계산 결과)
// ---------------------------

/** 견적서 금액 합계 계산 결과 */
export interface InvoiceSummary {
  /** 공급가액 합계 (모든 항목의 supplyAmount 합산) */
  totalSupply: number;
  /** 부가세 합계 (모든 항목의 taxAmount 합산) */
  totalTax: number;
  /** 최종 합계 = 공급가액 합계 + 부가세 합계 */
  grandTotal: number;
}

// ---------------------------
// API 응답 타입
// ---------------------------

/** 견적서 API 응답 성공 케이스 */
export interface InvoiceApiSuccess {
  success: true;
  data: Invoice;
}

/** 견적서 API 응답 실패 케이스 */
export interface InvoiceApiError {
  success: false;
  error: InvoiceErrorCode;
  message: string;
}

/** 견적서 API 응답 유니온 타입 */
export type InvoiceApiResponse = InvoiceApiSuccess | InvoiceApiError;

// ---------------------------
// 오류 코드 (접근 거부 페이지용)
// ---------------------------

/**
 * 견적서 접근 오류 유형
 * - TOKEN_INVALID: 토큰 형식 오류 또는 불일치
 * - TOKEN_EXPIRED: 만기일이 지난 견적서
 * - INVOICE_NOT_FOUND: 존재하지 않는 견적서 ID
 * - SERVER_ERROR: Notion API 또는 서버 내부 오류
 */
export type InvoiceErrorCode =
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "INVOICE_NOT_FOUND"
  | "SERVER_ERROR";
