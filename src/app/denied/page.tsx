/**
 * 접근 거부 페이지
 *
 * 경로: /denied?reason=[InvoiceErrorCode]
 *
 * 오류 유형별로 다른 메시지를 표시하고 담당자 연락 링크를 제공합니다.
 * 검색엔진에 색인되지 않도록 noindex 설정합니다.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Mail, ArrowLeft } from "lucide-react";
import type { InvoiceErrorCode } from "@/types/invoice";

export const metadata: Metadata = {
  title: "접근 거부 | Invoice Web",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ reason?: string }>;
}

/**
 * 오류 코드에 따른 사용자 안내 메시지 정의
 */
const errorMessages: Record<InvoiceErrorCode, { title: string; description: string }> = {
  TOKEN_INVALID: {
    title: "유효하지 않은 링크입니다",
    description:
      "접근 링크가 올바르지 않거나 손상되었습니다. 담당자로부터 받은 원본 링크를 다시 확인해 주세요.",
  },
  TOKEN_EXPIRED: {
    title: "만기된 견적서입니다",
    description:
      "이 견적서의 유효 기간이 지났습니다. 담당자에게 문의하여 새 견적서 링크를 요청해 주세요.",
  },
  INVOICE_NOT_FOUND: {
    title: "존재하지 않는 견적서입니다",
    description:
      "요청하신 견적서를 찾을 수 없습니다. 링크가 정확한지 확인하거나 담당자에게 문의해 주세요.",
  },
  SERVER_ERROR: {
    title: "서버 오류가 발생했습니다",
    description:
      "일시적인 서버 오류입니다. 잠시 후 다시 시도해 주시거나, 문제가 지속되면 담당자에게 문의해 주세요.",
  },
};

/** 알 수 없는 오류 코드에 대한 기본 메시지 */
const defaultError = {
  title: "접근할 수 없습니다",
  description:
    "이 페이지에 접근할 수 없습니다. 담당자로부터 올바른 공유 링크를 받았는지 확인해 주세요.",
};

/**
 * 접근 거부 페이지 컴포넌트
 */
export default async function DeniedPage({ searchParams }: PageProps) {
  const { reason } = await searchParams;

  // 오류 코드 유효성 확인 후 메시지 선택
  const isValidCode = (code: string | undefined): code is InvoiceErrorCode =>
    Boolean(code && code in errorMessages);

  const { title, description } = isValidCode(reason)
    ? errorMessages[reason]
    : defaultError;

  // 담당자 이메일 (환경변수)
  const contactEmail = process.env.CONTACT_EMAIL;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">

        {/* 오류 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        {/* 오류 메시지 */}
        <h1 className="text-xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">{description}</p>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3">

          {/* 담당자 연락 버튼 (이메일이 설정된 경우에만 표시) */}
          {contactEmail && (
            <Link
              href={`mailto:${contactEmail}?subject=견적서 접근 문의`}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              담당자에게 문의하기
            </Link>
          )}

          {/* 홈으로 돌아가기 */}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-border rounded-md text-sm font-medium text-gray-600 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>

        {/* 오류 코드 표시 (디버깅용) */}
        {reason && (
          <p className="mt-6 text-xs text-gray-400">
            오류 코드: {reason}
          </p>
        )}
      </div>
    </div>
  );
}
