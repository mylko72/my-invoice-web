/**
 * 네비게이션 바 컴포넌트 (NavBar)
 *
 * 모든 페이지 상단에 고정(sticky)으로 표시되는 글로벌 헤더입니다.
 * 데스크톱과 모바일 환경 모두를 지원하는 반응형 네비게이션입니다.
 *
 * 주요 기능:
 * - 현재 경로(pathname)에 따라 활성화된 메뉴 항목을 시각적으로 표시
 * - 다크/라이트 모드 전환 버튼
 * - 모바일 화면에서 햄버거 메뉴를 통한 드롭다운 네비게이션
 * - 모바일 메뉴 외부 클릭 시 자동으로 닫히는 UX
 * - aria-current, aria-expanded 등 접근성 속성 포함
 *
 * "use client" 선언 이유:
 * useState, useEffect, usePathname 등 클라이언트 전용 훅을 사용하기 때문입니다.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

/**
 * 네비게이션 링크 목록
 * Invoice Web MVP는 공개 페이지가 견적서 뷰 단 하나이므로 최소 구성입니다.
 * Phase 2 관리자 대시보드 구현 시 이 배열에 항목을 추가하세요.
 */
const navLinks = [
  { href: "/", label: "홈" },
];

/**
 * NavBar 컴포넌트
 *
 * layout.tsx에서 단 한 번 배치되어 전체 앱에 적용됩니다.
 * ThemeContext를 통해 현재 테마를 읽고, toggleTheme으로 테마를 전환합니다.
 */
export default function NavBar() {
  const { theme, toggleTheme } = useTheme();

  // 현재 URL 경로를 가져옵니다. 활성 메뉴 항목을 강조 표시하는 데 사용합니다.
  const pathname = usePathname();

  // 모바일 메뉴 열림/닫힘 상태를 관리합니다.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 외부 클릭 감지를 위해 헤더 전체를 참조하는 ref입니다.
  const navRef = useRef<HTMLElement>(null);

  /**
   * 외부 클릭 시 모바일 메뉴를 닫는 이벤트 핸들러
   *
   * 메뉴가 열려있을 때만 이벤트 리스너를 등록하고,
   * 메뉴가 닫히거나 컴포넌트가 언마운트될 때 리스너를 제거합니다.
   * 이렇게 해야 불필요한 이벤트 리스너가 쌓이지 않습니다(메모리 누수 방지).
   */
  useEffect(() => {
    // 메뉴가 닫혀있으면 이벤트 리스너를 등록할 필요가 없습니다.
    if (!mobileMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // 클릭한 요소가 nav 영역 밖이라면 메뉴를 닫습니다.
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // 클린업 함수: 메뉴가 닫히거나 컴포넌트가 사라질 때 리스너를 제거합니다.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    // sticky top-0: 스크롤해도 항상 화면 상단에 고정됩니다.
    // backdrop-blur: 스크롤 시 배경이 흐릿하게 처리되어 가독성을 높입니다.
    <header ref={navRef} className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* 로고: 홈으로 이동하는 링크입니다 */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <FileText className="h-6 w-6 text-primary" />
          <span>Invoice Web</span>
        </Link>

        {/* 데스크톱 네비게이션: md(768px) 이상에서만 표시됩니다 */}
        <nav className="hidden md:flex items-center gap-1" aria-label="주요 네비게이션">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                pathname === link.href
                  ? "bg-accent text-accent-foreground"  // 현재 페이지: 배경 강조
                  : "text-muted-foreground"              // 나머지 페이지: 흐린 텍스트
              }`}
              // aria-current="page": 스크린리더가 현재 페이지임을 알 수 있도록 합니다.
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 우측 버튼 그룹 */}
        <div className="flex items-center gap-2">

          {/*
            다크/라이트 모드 토글 버튼
            현재 테마에 따라 아이콘이 전환됩니다.
            aria-label로 버튼의 역할을 스크린리더에게 알립니다.
          */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />   // 다크 모드일 때: 태양 아이콘(밝게)
            ) : (
              <Moon className="h-5 w-5" />  // 라이트 모드일 때: 달 아이콘(어둡게)
            )}
          </Button>

          {/*
            모바일 메뉴 토글 버튼 (햄버거 메뉴)
            md 이상에서는 숨겨집니다(md:hidden).
            aria-expanded로 메뉴 열림 상태를 스크린리더에게 알립니다.
          */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="모바일 메뉴 토글"
            aria-expanded={mobileMenuOpen}
          >
            {/* 메뉴 열림 상태에 따라 X(닫기) 또는 햄버거(열기) 아이콘을 표시합니다 */}
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/*
        모바일 드롭다운 메뉴
        mobileMenuOpen이 true일 때만 렌더링됩니다.
        md 이상 화면에서는 숨겨집니다(md:hidden).
      */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1" aria-label="모바일 네비게이션">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
                aria-current={pathname === link.href ? "page" : undefined}
                // 메뉴 항목 클릭 시 모바일 메뉴를 닫습니다
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
