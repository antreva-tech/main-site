"use client";

/**
 * Theme context for dashboard: light (default) vs dark.
 * Persists choice in localStorage; applies .dark class to wrapper so Tailwind dark: variants apply.
 * Light mode styles are never modified—only dark-mode overrides are added.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "antreva-dashboard-theme";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

/**
 * Provider for dashboard theme. Renders children inside a wrapper that receives
 * class "dark" when theme is dark, so Tailwind dark: variants apply.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  /** Hydrate from localStorage on mount. */
  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  /** Sync .dark to document root so portaled content (e.g. DragOverlay) gets dark mode. */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className={theme === "dark" ? "dark h-full min-h-0 flex flex-col" : "h-full min-h-0 flex flex-col"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
