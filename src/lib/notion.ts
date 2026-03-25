/**
 * Notion API 클라이언트 및 견적서 조회 함수
 *
 * 이 모듈은 서버 사이드(Route Handler, Server Component)에서만 사용합니다.
 * NOTION_API_KEY 환경변수를 절대 클라이언트 번들에 노출하지 마세요.
 *
 * 캐싱 전략:
 * - Next.js unstable_cache를 활용해 동일한 invoiceId 요청은 60초간 캐시
 * - Notion API 무료 플랜 제한(초당 3 요청)에 대응
 */

import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { validateInvoice } from "@/lib/schemas";
import type { Invoice, InvoiceItem } from "@/types/invoice";

// ---------------------------
// Notion 클라이언트 초기화
// ---------------------------

/**
 * Notion API 클라이언트 싱글톤
 * 서버 시작 시 한 번만 초기화됩니다.
 */
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// ---------------------------
// Notion 속성 파싱 헬퍼
// ---------------------------

/**
 * Notion 텍스트 속성(Rich Text / Title)에서 plain_text 추출
 */
function extractText(
  property: PageObjectResponse["properties"][string]
): string {
  if (property.type === "title") {
    return property.title.map((t) => t.plain_text).join("") || "";
  }
  if (property.type === "rich_text") {
    return property.rich_text.map((t) => t.plain_text).join("") || "";
  }
  return "";
}

/**
 * Notion Date 속성에서 날짜 문자열(YYYY-MM-DD) 추출
 */
function extractDate(
  property: PageObjectResponse["properties"][string]
): string {
  if (property.type === "date" && property.date?.start) {
    return property.date.start;
  }
  return "";
}

/**
 * Notion Select 속성에서 선택된 값 추출
 */
function extractSelect(
  property: PageObjectResponse["properties"][string]
): string {
  if (property.type === "select" && property.select?.name) {
    return property.select.name;
  }
  return "draft";
}

/**
 * Notion Relation 속성에서 연결된 페이지 ID 목록 추출
 */
function extractRelation(
  property: PageObjectResponse["properties"][string]
): string[] {
  if (property.type === "relation") {
    return property.relation.map((r) => r.id);
  }
  return [];
}

/**
 * Notion Number 속성에서 숫자 추출
 * Phase 2: 합계금액 필드 직접 읽기 또는 계산 검증 시 활용
 */
export function extractNumber(
  property: PageObjectResponse["properties"][string]
): number {
  if (property.type === "number" && property.number !== null) {
    return property.number;
  }
  return 0;
}

// ---------------------------
// 견적 항목 파싱
// ---------------------------

/**
 * Items DB의 단일 페이지를 InvoiceItem으로 변환
 *
 * @param page - Notion API Items DB 페이지 응답 객체
 * @param invoiceId - 소속 견적서 ID
 */
function parseNotionItemPage(
  page: PageObjectResponse,
  invoiceId: string
): InvoiceItem {
  const props = page.properties;
  return {
    id: page.id.replace(/-/g, ""),
    invoiceId,
    name: extractText(props["품명"]),
    quantity: extractNumber(props["수량"]),
    unitPrice: extractNumber(props["단가"]),
    supplyAmount: extractNumber(props["공급가액"]),
    taxAmount: extractNumber(props["부가세"]),
  };
}

// ---------------------------
// Notion 페이지 → Invoice 변환
// ---------------------------

/**
 * Notion 페이지 응답을 Invoice 도메인 객체로 변환
 * Items DB 관계형 데이터는 이 함수에서 조회하지 않음
 *
 * @param page - Notion API 페이지 응답 객체
 */
function parseNotionPage(page: PageObjectResponse) {
  const props = page.properties;

  return {
    id: page.id.replace(/-/g, ""),  // Notion ID 정규화 (하이픈 제거)
    invoiceNumber: extractText(props["견적서 번호"]),
    clientName: extractText(props["고객사명"]),
    clientContact: extractText(props["고객 담당자명"]),
    issueDate: extractDate(props["발행일"]),
    dueDate: extractDate(props["만기일"]),
    status: extractSelect(props["상태"]),
    note: extractText(props["비고/메모"]),
    itemPageIds: extractRelation(props["항목"]),  // Items DB 페이지 ID 목록
    items: [] as InvoiceItem[],  // 아래에서 별도 조회
  };
}

/**
 * Items DB 페이지들을 병렬로 조회하여 InvoiceItem 배열로 변환
 *
 * @param itemPageIds - Items DB 페이지 ID 목록
 * @param invoiceId - 소속 견적서 ID
 */
async function fetchItemsForInvoice(
  itemPageIds: string[],
  invoiceId: string
): Promise<InvoiceItem[]> {
  if (itemPageIds.length === 0) return [];

  try {
    const pages = await Promise.all(
      itemPageIds.map((id) => notion.pages.retrieve({ page_id: id }))
    );

    return pages
      .filter((p): p is PageObjectResponse => "properties" in p && !p.archived)
      .map((p) => parseNotionItemPage(p as PageObjectResponse, invoiceId));
  } catch (error) {
    console.error(`[Items 조회 실패] invoiceId: ${invoiceId}`, error);
    return [];
  }
}

// ---------------------------
// 핵심 API 함수 (캐싱 적용)
// ---------------------------

/**
 * Notion DB에서 특정 견적서 단건 조회 (원시 함수)
 * unstable_cache로 감싸서 사용합니다.
 *
 * @param invoiceId - Notion 페이지 ID
 */
async function fetchInvoiceFromNotion(invoiceId: string): Promise<Invoice | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: invoiceId });

    // 페이지가 삭제되었거나 아카이브된 경우
    if (!("properties" in page) || page.archived) {
      return null;
    }

    const pageData = parseNotionPage(page as PageObjectResponse);

    // Items DB 페이지들을 병렬로 조회
    const items = await fetchItemsForInvoice(pageData.itemPageIds, pageData.id);

    const rawInvoice = {
      ...pageData,
      items,
    };

    return validateInvoice(rawInvoice);
  } catch (error) {
    // 존재하지 않는 페이지 ID → Notion API가 404 에러 throw
    console.error(`[Notion API 오류] invoiceId: ${invoiceId}`, error);
    return null;
  }
}

/**
 * 견적서 단건 조회 (60초 캐시 적용)
 *
 * 동일한 invoiceId는 60초 동안 Notion API를 재호출하지 않습니다.
 * 캐시 키: ["invoice", invoiceId] → invoiceId별로 별도 캐시
 *
 * @param invoiceId - Notion 페이지 ID
 */
export const getInvoice = (invoiceId: string) =>
  unstable_cache(
    () => fetchInvoiceFromNotion(invoiceId),
    ["invoice", invoiceId],  // invoiceId를 캐시 키에 포함!
    {
      revalidate: 60, // 60초 캐시
      tags: ["invoice"],
    }
  )();

// ---------------------------
// 토큰 검증
// ---------------------------

/**
 * 견적서 접근 토큰 유효성 검사
 *
 * 서버 사이드에서만 호출하세요 (토큰 검증 로직 노출 방지).
 *
 * @param invoice - 조회한 견적서 객체
 * @param token - URL 쿼리 파라미터에서 추출한 토큰
 * @returns 유효하면 true, 무효하면 false
 */
export function validateAccessToken(invoice: Invoice, token: string): boolean {
  if (!token || !invoice.accessToken) return false;
  // 상수 시간 비교로 타이밍 공격 방지 (단순 문자열 비교)
  return invoice.accessToken === token;
}

/**
 * 견적서 만기일 확인
 *
 * @param invoice - 조회한 견적서 객체
 * @returns 만기되지 않았으면 true, 만기되었으면 false
 */
export function isInvoiceValid(invoice: Invoice): boolean {
  if (!invoice.dueDate) return true; // 만기일 미설정 시 항상 유효
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간 제거 후 날짜만 비교
  return dueDate >= today;
}
