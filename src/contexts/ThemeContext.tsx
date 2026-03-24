"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// 테마 타입 정의
type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// DOM에 테마 클래스 적용 (컴포넌트 외부 순수 함수)
function applyThemeClass(newTheme: Theme) {
  const root = document.documentElement;
  if (newTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

/**
 * 초기 테마 결정 (localStorage → 시스템 설정 순)
 * useState 초기화 함수로 사용하여 useEffect 내 setState 카스케이드를 방지합니다.
 */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const savedTheme = localStorage.getItem("theme") as Theme | null;
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// ThemeProvider 컴포넌트
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // useState 초기화 함수로 초기 테마를 한 번만 읽어옵니다
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // 초기 테마를 DOM에 반영합니다 (서버/클라이언트 불일치 방지)
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // 테마 변경 함수
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // 테마 토글 함수
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// useTheme 훅
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme는 ThemeProvider 내부에서 사용해야 합니다.");
  }
  return context;
}
