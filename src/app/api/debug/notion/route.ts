import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { validateInvoice } from "@/lib/schemas";
import type { InvoiceItem } from "@/types/invoice";

// parseNotionPage 복사 (테스트용)
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

function extractDate(
  property: PageObjectResponse["properties"][string]
): string {
  if (property.type === "date" && property.date?.start) {
    return property.date.start;
  }
  return "";
}

function extractSelect(
  property: PageObjectResponse["properties"][string]
): string {
  if (property.type === "select" && property.select?.name) {
    return property.select.name;
  }
  return "draft";
}

function extractRelation(
  property: PageObjectResponse["properties"][string]
): string[] {
  if (property.type === "relation") {
    return property.relation.map((r) => r.id);
  }
  return [];
}

function extractNumber(
  property: PageObjectResponse["properties"][string]
): number {
  if (property.type === "number" && property.number !== null) {
    return property.number;
  }
  return 0;
}

function parseNotionItemPage(
  page: PageObjectResponse,
  invoiceId: string
) {
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

function parseNotionPage(page: PageObjectResponse) {
  const props = page.properties;

  return {
    id: page.id.replace(/-/g, ""),
    invoiceNumber: extractText(props["견적서 번호"]),
    clientName: extractText(props["고객사명"]),
    clientContact: extractText(props["고객 담당자명"]),
    issueDate: extractDate(props["발행일"]),
    dueDate: extractDate(props["만기일"]),
    status: extractSelect(props["상태"]),
    note: extractText(props["비고/메모"]),
    itemPageIds: extractRelation(props["항목"]),
    items: [] as any[],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId") || "32d8d00a-e1e0-808e-b22c-d8fe528b3620";

  try {
    const notion = new Client({
      auth: process.env.NOTION_API_KEY,
    });

    console.log(`\n📡 Notion API 테스트`);
    console.log(`🔑 API Key: ${process.env.NOTION_API_KEY?.substring(0, 20)}...`);
    console.log(`🆔 Page ID: ${pageId}\n`);

    const page = await notion.pages.retrieve({ page_id: pageId });

    if (!("properties" in page)) {
      return Response.json({
        success: false,
        error: "페이지가 삭제되었거나 아카이브됨",
      });
    }

    const properties = Object.keys(page.properties).reduce(
      (acc, key) => {
        acc[key] = page.properties[key].type;
        return acc;
      },
      {} as Record<string, string>
    );

    // parseNotionPage 결과 출력
    const parsed = parseNotionPage(page as PageObjectResponse);
    console.log("✅ 파싱 결과:", JSON.stringify(parsed, null, 2));

    // Items 실제 조회
    let items: InvoiceItem[] = [];
    if (parsed.itemPageIds.length > 0) {
      try {
        const itemPages = await Promise.all(
          parsed.itemPageIds.map((id) => notion.pages.retrieve({ page_id: id }))
        );
        items = itemPages
          .filter((p): p is PageObjectResponse => "properties" in p && !p.archived)
          .map((p) => parseNotionItemPage(p, parsed.id));
        console.log("✅ Items 조회 결과:", JSON.stringify(items, null, 2));
      } catch (itemError) {
        console.error("❌ Items 조회 실패:", itemError);
      }
    }

    // Zod 검증 시뮬레이션 (실제 items 포함)
    const rawInvoice = { ...parsed, items };
    const validated = validateInvoice(rawInvoice);
    console.log("✅ 검증 결과:", validated);

    return Response.json({
      success: true,
      pageId,
      archived: page.archived,
      properties,
      parsed,
      items,
      rawInvoice,
      validated,
    });
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error(`❌ Notion API 에러:`, error);

    return Response.json({
      success: false,
      error: err.message || "Unknown error",
      status: err.status || 500,
    });
  }
}
