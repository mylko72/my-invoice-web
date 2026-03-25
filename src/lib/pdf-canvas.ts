/**
 * html2canvas + jsPDF 기반 PDF 생성 모듈
 *
 * @react-pdf/renderer에서 한글 폰트 이슈가 발생할 때 사용하는 대안입니다.
 * 현재 렌더링된 DOM을 캡처하여 PDF로 변환합니다.
 *
 * 주의:
 * - 품목이 많아 페이지가 넘어가는 경우 멀티 페이지 처리 로직 추가 필요
 * - 클라이언트에서만 동작 (window 객체 필요)
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * DOM 요소를 PDF로 변환하여 다운로드
 *
 * @param elementId - 캡처할 DOM 요소의 ID
 * @param fileName - 다운로드될 PDF 파일명
 * @throws {Error} 요소가 없거나 변환 실패 시
 */
export async function generatePdfFromDom(
  elementId: string,
  fileName: string
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`요소를 찾을 수 없습니다: ${elementId}`);
    }

    // DOM을 Canvas로 변환
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Canvas를 이미지 데이터로 변환
    const imgData = canvas.toDataURL("image/png");

    // PDF 생성 (A4 크기)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 이미지 크기에 맞춰 PDF 페이지 추가
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 10; // 좌우 여백 5mm씩
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 5; // 상단 여백

    // 첫 페이지
    pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 10;

    // 추가 페이지들 (멀티 페이지 처리)
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 10;
    }

    // PDF 다운로드
    pdf.save(fileName);
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error);
    throw error;
  }
}

/**
 * 현재 페이지 전체를 PDF로 변환하여 다운로드
 *
 * @param fileName - 다운로드될 PDF 파일명
 * @throws {Error} 변환 실패 시
 */
export async function generatePdfFromPage(fileName: string): Promise<void> {
  try {
    // 전체 body를 캡처
    const canvas = await html2canvas(document.body, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 5;

    pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 10;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 10;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error);
    throw error;
  }
}
