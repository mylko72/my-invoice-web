/**
 * 푸터 컴포넌트 (Footer)
 *
 * Invoice Web MVP의 글로벌 푸터입니다.
 * 담당자 연락처와 저작권 정보를 표시합니다.
 *
 * 인쇄/PDF 출력 시에는 print:hidden 클래스로 숨겨집니다.
 *
 * 서버 컴포넌트로 동작합니다 ("use client" 없음).
 */

import Link from "next/link";

/**
 * Footer 컴포넌트
 */
export default function Footer() {
  const contactEmail = process.env.CONTACT_EMAIL;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background print:hidden">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* 담당자 연락처 (환경변수 설정 시 표시) */}
          {contactEmail && (
            <Link
              href={`mailto:${contactEmail}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="담당자에게 이메일 문의"
            >
              문의: {contactEmail}
            </Link>
          )}

          {/* 저작권 정보 */}
          <p className="text-xs text-muted-foreground">
            © {currentYear} Invoice Web. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
