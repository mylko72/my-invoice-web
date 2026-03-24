/**
 * 루트 레이아웃 (Root Layout)
 *
 * Next.js App Router에서 모든 페이지를 감싸는 최상위 레이아웃 컴포넌트입니다.
 * 이 파일에 설정한 내용은 앱 전체에 공통으로 적용됩니다.
 *
 * 주요 역할:
 * - 전역 폰트(Geist Sans, Geist Mono) 설정
 * - 다크/라이트 모드를 제어하는 ThemeProvider 적용
 * - 상단 NavBar와 하단 Footer를 모든 페이지에 공통으로 배치
 * - 토스트 알림(Sonner)을 화면 우측 하단에 고정
 * - 키보드 사용자를 위한 스킵 네비게이션 링크 제공
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

/**
 * Geist Sans: 본문 텍스트용 산세리프 폰트
 * CSS 변수 --font-geist-sans로 등록되어 Tailwind에서 사용 가능합니다.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Geist Mono: 코드 블록용 고정폭 폰트
 * CSS 변수 --font-geist-mono로 등록되어 Tailwind에서 사용 가능합니다.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 브라우저 탭과 검색엔진(SEO)에 표시되는 메타데이터
 * Next.js가 자동으로 <head> 태그 안에 삽입합니다.
 */
export const metadata: Metadata = {
  title: "Invoice Web",
  description: "Notion 기반 견적서 공유 및 PDF 다운로드 서비스",
};

/**
 * RootLayout 컴포넌트
 *
 * App Router의 최상위 레이아웃입니다.
 * children에는 각 페이지(page.tsx)의 내용이 자동으로 주입됩니다.
 *
 * @param children - 각 라우트 페이지 컴포넌트
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="ko": 스크린리더와 검색엔진이 한국어 페이지임을 인식하도록 합니다.
    // suppressHydrationWarning: 다크모드 전환 시 발생하는 서버/클라이언트 불일치 경고를 억제합니다.
    <html lang="ko" suppressHydrationWarning>
      <body
        // 폰트 CSS 변수를 body에 적용하고, 테마 전환 시 부드러운 색상 전환을 위해 transition-colors를 추가합니다.
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        {/*
          스킵 네비게이션 링크: 키보드 및 스크린리더 사용자가 반복적인 네비게이션을
          건너뛰고 본문으로 바로 이동할 수 있도록 돕는 접근성 요소입니다.
          평소에는 화면 밖에 숨겨져 있다가(sr-only), Tab 키를 누를 때만 보입니다.
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:border focus:rounded-md focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          본문으로 바로가기
        </a>

        {/*
          ThemeProvider: Context API를 통해 하위 모든 컴포넌트에 현재 테마(dark/light)와
          테마 변경 함수(toggleTheme)를 전달합니다.
        */}
        <ThemeProvider>
          {/* 모든 페이지 상단에 고정되는 네비게이션 바 */}
          <NavBar />

          {/* id="main-content": 스킵 네비게이션 링크의 이동 목적지입니다. */}
          <main id="main-content" className="min-h-screen">
            {children}
          </main>

          {/* 모든 페이지 하단에 표시되는 푸터 */}
          <Footer />

          {/*
            Toaster: 화면 우측 하단에 토스트 알림을 표시하는 전역 컴포넌트입니다.
            richColors를 활성화하면 success/error 등 유형별로 색상이 구분됩니다.
          */}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
