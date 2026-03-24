/**
 * 홈 페이지
 *
 * Invoice Web MVP의 루트 페이지입니다.
 * 클라이언트는 이 페이지를 직접 방문하지 않으며,
 * 담당자가 공유한 /invoice/[id]?token=... 링크로 바로 접근합니다.
 *
 * 이 페이지는 직접 접근 시 서비스 안내를 표시합니다.
 */

import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full text-center">

        {/* 로고/아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* 서비스 안내 */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Invoice Web
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          견적서 확인 서비스입니다.
          <br />
          담당자로부터 공유받은 링크로 견적서를 확인하세요.
        </p>

        {/* 안내 메시지 */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>
            <strong>견적서 링크 형식:</strong>
          </p>
          <code className="block mt-2 text-xs bg-background rounded px-3 py-2 font-mono break-all">
            /invoice/[견적서ID]?token=[접근토큰]
          </code>
        </div>

        {/* 관련 링크 */}
        <div className="mt-8">
          <Link
            href="https://notion.so"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Notion으로 견적서 관리
          </Link>
        </div>
      </div>
    </div>
  );
}
