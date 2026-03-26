"use client";

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
  let styleSheet: HTMLStyleElement | null = null;
  let allElements: NodeListOf<Element> | null = null;
  let originalStyles: Map<Element, string | null> = new Map();

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      const errorMsg = `요소를 찾을 수 없습니다: ${elementId}. 현재 DOM: ${document.body.innerHTML.substring(0, 200)}`;
      throw new Error(errorMsg);
    }

    console.log(`[PDF] ${elementId} 요소 찾음, 캡처 시작...`);

    // Tailwind CSS v4의 oklch() 색상을 rgb()로 변환하기 위한 임시 스타일 추가
    // html2canvas가 oklch() 함수를 파싱하지 못하므로 사전에 인라인 스타일로 변환
    styleSheet = document.createElement("style");
    styleSheet.textContent = `
      * {
        background-color: var(--bg-color, unset) !important;
        color: var(--text-color, unset) !important;
        border-color: var(--border-color, unset) !important;
      }
    `;
    document.head.appendChild(styleSheet);

    // 모든 요소의 계산된 스타일을 인라인으로 적용
    allElements = document.querySelectorAll("*");
    originalStyles = new Map<Element, string>();

    allElements.forEach((el) => {
      const element = el as HTMLElement;
      // 원본 스타일 저장
      originalStyles!.set(el, element.getAttribute("style") || "");

      const computed = window.getComputedStyle(element);

      // 주요 스타일만 인라인으로 설정 (oklch 문제 회피)
      if (computed.backgroundColor && !computed.backgroundColor.startsWith("rgba(0")) {
        element.style.backgroundColor = computed.backgroundColor;
      }
      if (computed.color) {
        element.style.color = computed.color;
      }
      if (computed.borderColor) {
        element.style.borderColor = computed.borderColor;
      }
    });

    console.log("[PDF] 스타일 인라인 변환 완료");

    // DOM을 Canvas로 변환
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
    });

    console.log(`[PDF] Canvas 생성 완료: ${canvas.width}x${canvas.height}`);

    // Canvas를 이미지 데이터로 변환
    const imgData = canvas.toDataURL("image/png");
    console.log(`[PDF] 이미지 데이터 생성 완료, 크기: ${imgData.length}`);

    // PDF 생성 (A4 크기)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    console.log("[PDF] jsPDF 객체 생성 완료");

    // 이미지 크기에 맞춰 PDF 페이지 추가
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 10; // 좌우 여백 5mm씩
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 5; // 상단 여백
    let pageCount = 1;

    // 첫 페이지
    pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 10;

    // 추가 페이지들 (멀티 페이지 처리)
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 10;
      pageCount++;
    }

    console.log(`[PDF] ${pageCount} 페이지 추가 완료`);

    // PDF 다운로드
    pdf.save(fileName);
    console.log(`[PDF] 다운로드 완료: ${fileName}`);

    // 스타일 복원
    allElements.forEach((el) => {
      const element = el as HTMLElement;
      const originalStyle = originalStyles.get(el);
      if (originalStyle !== undefined) {
        if (originalStyle) {
          element.setAttribute("style", originalStyle);
        } else {
          element.removeAttribute("style");
        }
      }
    });

    // 임시 스타일시트 제거
    styleSheet.remove();

    console.log("[PDF] 스타일 복원 완료");
  } catch (error) {
    console.error("[PDF] 생성 중 오류 발생:", error);
    if (error instanceof Error) {
      console.error("[PDF] 에러 메시지:", error.message);
      console.error("[PDF] 에러 스택:", error.stack);
    }

    // 에러 발생해도 스타일 복원
    try {
      if (allElements) {
        allElements.forEach((el) => {
          const element = el as HTMLElement;
          const originalStyle = originalStyles.get(el);
          if (originalStyle !== undefined) {
            if (originalStyle) {
              element.setAttribute("style", originalStyle);
            } else {
              element.removeAttribute("style");
            }
          }
        });
      }
      if (styleSheet) {
        styleSheet.remove();
      }
    } catch (cleanupError) {
      console.error("[PDF] 스타일 복원 중 오류:", cleanupError);
    }

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
