import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { formatAmount, formatDate, generatePdfFileName } from "@/utils/format";
import type { Invoice } from "@/types/invoice";

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 10,
  },
  companyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  companyBlock: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    fontWeight: "bold",
    width: 60,
  },
  value: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  table: {
    width: "100%",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#374151",
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: "bold",
    backgroundColor: "#f9fafb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingTop: 5,
    paddingBottom: 5,
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
  tableCellRight: {
    flex: 1,
    padding: 5,
    textAlign: "right",
  },
  tableCellCenter: {
    flex: 1,
    padding: 5,
    textAlign: "center",
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: "#374151",
    paddingTop: 10,
    marginTop: 10,
    fontWeight: "bold",
  },
  totalLabel: {
    flex: 2,
    paddingRight: 10,
    textAlign: "right",
  },
  totalValue: {
    flex: 1,
    textAlign: "right",
    paddingLeft: 10,
  },
  note: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  noteTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  noteContent: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    textAlign: "center",
    fontSize: 9,
    color: "#6b7280",
  },
});

// PDF 컴포넌트들
interface PdfHeaderProps {
  invoice: Invoice;
}

function InvoicePdfHeader({ invoice }: PdfHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>견적서</Text>
      <View style={styles.companyInfo}>
        <View style={styles.companyBlock}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>번호:</Text>
            <Text style={styles.value}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>발행:</Text>
            <Text style={styles.value}>
              {formatDate(invoice.issueDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>만기:</Text>
            <Text style={styles.value}>
              {formatDate(invoice.dueDate)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

interface PdfClientInfoProps {
  invoice: Invoice;
}

function InvoicePdfClientInfo({ invoice }: PdfClientInfoProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>고객정보</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>고객사:</Text>
        <Text style={styles.value}>{invoice.clientName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>담당자:</Text>
        <Text style={styles.value}>{invoice.clientContact || "-"}</Text>
      </View>
    </View>
  );
}

interface PdfItemsTableProps {
  invoice: Invoice;
}

function InvoicePdfItemsTable({ invoice }: PdfItemsTableProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>품목</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.tableCell, flex: 4 }}>상품/서비스</Text>
          <Text style={styles.tableCellCenter}>수량</Text>
          <Text style={styles.tableCellRight}>단가</Text>
          <Text style={styles.tableCellRight}>금액</Text>
        </View>
        {invoice.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, flex: 4 }}>{item.name}</Text>
            <Text style={styles.tableCellCenter}>{item.quantity}</Text>
            <Text style={styles.tableCellRight}>
              {formatAmount(item.unitPrice)}
            </Text>
            <Text style={styles.tableCellRight}>
              {formatAmount(item.supplyAmount)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface PdfSummaryProps {
  invoice: Invoice;
}

function InvoicePdfSummary({ invoice }: PdfSummaryProps) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.supplyAmount, 0);
  const taxAmount = invoice.items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + taxAmount;

  return (
    <View style={styles.section}>
      <View style={styles.totalRow}>
        <Text style={{ ...styles.totalLabel, flex: 3 }}>공급가액</Text>
        <Text style={styles.totalValue}>{formatAmount(subtotal)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={{ ...styles.totalLabel, flex: 3 }}>부가세</Text>
        <Text style={styles.totalValue}>{formatAmount(taxAmount)}</Text>
      </View>
      <View
        style={{
          ...styles.totalRow,
          borderTopWidth: 2,
          borderTopColor: "#000",
          marginTop: 10,
          paddingTop: 15,
        }}
      >
        <Text style={{ ...styles.totalLabel, flex: 3, fontSize: 14 }}>합계</Text>
        <Text style={{ ...styles.totalValue, fontSize: 14 }}>
          {formatAmount(total)}
        </Text>
      </View>
    </View>
  );
}

interface PdfNoteProps {
  invoice: Invoice;
}

function InvoicePdfNote({ invoice }: PdfNoteProps) {
  if (!invoice.note) return null;

  return (
    <View style={styles.note}>
      <Text style={styles.noteTitle}>비고</Text>
      <Text style={styles.noteContent}>{invoice.note}</Text>
    </View>
  );
}

// 메인 PDF 문서 컴포넌트
interface InvoicePdfDocumentProps {
  invoice: Invoice;
}

function InvoicePdfDocument({ invoice }: InvoicePdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <InvoicePdfHeader invoice={invoice} />
        <InvoicePdfClientInfo invoice={invoice} />
        <InvoicePdfItemsTable invoice={invoice} />
        <InvoicePdfSummary invoice={invoice} />
        <InvoicePdfNote invoice={invoice} />
        <View style={styles.footer}>
          <Text>
            이 견적서는 자동 생성되었습니다. | {new Date().getFullYear()}년{" "}
            {String(new Date().getMonth() + 1).padStart(2, "0")}월{" "}
            {String(new Date().getDate()).padStart(2, "0")}일
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// PDF 생성 및 다운로드 함수
export async function generateInvoicePdf(invoice: Invoice): Promise<void> {
  try {
    // PDF 생성
    const pdfBlob = await pdf(
      <InvoicePdfDocument invoice={invoice} />
    ).toBlob();

    // 파일명 생성
    const fileName = generatePdfFileName(
      invoice.invoiceNumber,
      invoice.issueDate
    );

    // 다운로드 트리거
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error);
    throw new Error("PDF 생성에 실패했습니다.");
  }
}
