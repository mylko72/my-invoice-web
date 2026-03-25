/**
 * Invoice Web MVP — Zod 스키마 정의
 *
 * Notion API 응답의 유효성을 검사하고 타입을 추론하기 위한 Zod 스키마 모음입니다.
 * 서버 사이드(Route Handler)에서만 사용됩니다.
 *
 * 사용 패턴:
 *   const result = invoiceSchema.safeParse(rawData);
 *   if (!result.success) throw new Error("스키마 검증 실패");
 *   const invoice = result.data; // 타입 안전한 Invoice 객체
 */

import { z } from "zod";

// ---------------------------
// 견적 항목 스키마
// ---------------------------

/**
 * 견적서 내 개별 품목 스키마
 * Notion 관계형 DB 또는 JSON 텍스트 파싱 결과를 검증합니다.
 */
export const invoiceItemSchema = z.object({
  id: z.string().min(1, "항목 ID는 필수입니다"),
  invoiceId: z.string().min(1, "견적서 ID는 필수입니다"),
  name: z.string().min(1, "품명은 필수입니다"),
  quantity: z.number().positive("수량은 양수여야 합니다"),
  unitPrice: z.number().nonnegative("단가는 0 이상이어야 합니다"),
  supplyAmount: z.number().nonnegative("공급가액은 0 이상이어야 합니다"),
  taxAmount: z.number().nonnegative("부가세는 0 이상이어야 합니다"),
});

// ---------------------------
// 견적서 상태 스키마
// ---------------------------

/** Notion Select 필드에서 읽어온 견적서 상태 */
export const invoiceStatusSchema = z.enum(["draft", "sent", "accepted"]);

// ---------------------------
// 견적서 메인 스키마
// ---------------------------

/**
 * 견적서 전체 스키마
 * Notion 페이지 파싱 결과를 검증합니다.
 */
export const invoiceSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{32}$/, "Notion 페이지 ID는 32자리 16진수여야 합니다"),
  invoiceNumber: z.string().min(1, "견적서 번호는 필수입니다"),
  clientName: z.string().min(1, "고객사명은 필수입니다"),
  clientContact: z.string().default(""),
  issueDate: z.string().min(1, "발행일은 필수입니다"),
  dueDate: z.string().min(1, "만기일은 필수입니다"),
  status: invoiceStatusSchema,
  note: z.string().default(""),
  accessToken: z.string().optional(),
  items: z.array(invoiceItemSchema).default([]),
});

// ---------------------------
// 타입 추론 (schema → TypeScript 타입)
// ---------------------------

/** Zod에서 추론한 InvoiceItem 타입 */
export type InvoiceItemSchema = z.infer<typeof invoiceItemSchema>;

/** Zod에서 추론한 Invoice 타입 */
export type InvoiceSchema = z.infer<typeof invoiceSchema>;

// ---------------------------
// 검증 유틸리티
// ---------------------------

/**
 * 견적서 데이터 유효성 검사
 * @param data - 검증할 원시 데이터 (Notion API 파싱 결과)
 * @returns 성공 시 Invoice 객체, 실패 시 null
 */
export function validateInvoice(data: unknown): InvoiceSchema | null {
  const result = invoiceSchema.safeParse(data);
  if (!result.success) {
    const flattened = result.error.flatten();
    console.error("[스키마 검증 실패]", flattened);
    console.error("[검증 상세]", JSON.stringify({
      formErrors: flattened.formErrors,
      fieldErrors: flattened.fieldErrors,
      inputData: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
    }, null, 2));
    return null;
  }
  return result.data;
}
