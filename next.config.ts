import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 견적서 뷰 페이지: 검색엔진 색인 방지 및 보안 헤더 적용
        source: "/invoice/:id",
        headers: [
          {
            // 검색엔진 크롤러가 견적서 페이지를 색인하지 않도록 차단
            key: "X-Robots-Tag",
            value: "noindex",
          },
          {
            // Content Security Policy:
            // - default-src 'self': 기본적으로 동일 출처만 허용
            // - script-src 'self' 'unsafe-inline': html2canvas, jsPDF 동작에 필요
            // - style-src 'self' 'unsafe-inline': Tailwind CSS, 인쇄 스타일에 필요
            // - img-src 'self' data:: PDF 내 이미지 및 base64 데이터 허용
            // - font-src 'self': 시스템/번들 폰트만 허용
            // - connect-src 'self' https://api.notion.com: Notion API 연동 허용
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self' https://api.notion.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
