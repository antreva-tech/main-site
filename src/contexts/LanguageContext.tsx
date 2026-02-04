"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { type Locale, type Translations, getTranslations } from "@/i18n";

const LOCALE_COOKIE = "locale";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

interface LanguageContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Use for currency/price display: "en" when app is English OR browser translated page to English (e.g. Chrome Translate). */
  currencyLocale: Locale;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

/**
 * Persists locale to cookie so server/refresh can use it.
 */
function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Reads locale from document.cookie (client-only). Returns undefined if missing or invalid. */
function getLocaleFromCookie(): Locale | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match?.[1]?.trim();
  return value === "en" || value === "es" ? value : undefined;
}

/**
 * Language provider component.
 * Wraps the app and provides translation context. Defaults to Spanish (es).
 * Persists locale in a cookie when changed.
 */
/** True when browser (e.g. Chrome Translate) has set html.lang to "en" or added a "translated" class. */
function detectChromeTranslatedToEnglish(): boolean {
  if (typeof document === "undefined") return false;
  const html = document.documentElement;
  if (html.getAttribute("lang") === "en") return true;
  if (/\btranslated\b/.test(html.className)) return true;
  return false;
}

export function LanguageProvider({
  children,
  defaultLocale = "es",
}: LanguageProviderProps) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [t, setT] = useState<Translations>(() => getTranslations(defaultLocale));
  const [chromeTranslatedToEnglish, setChromeTranslatedToEnglish] = useState(false);
  const [userChoseLocale, setUserChoseLocale] = useState(false);

  const setLocale = useCallback((newLocale: Locale) => {
    setUserChoseLocale(true);
    setLocaleState(newLocale);
    setT(getTranslations(newLocale));
    setLocaleCookie(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === "es" ? "en" : "es";
    setLocale(newLocale);
  }, [locale, setLocale]);

  useEffect(() => {
    setLocaleCookie(locale);
  }, [locale]);

  /** Main site (/) always starts in Spanish on load/refresh. */
  useEffect(() => {
    if (pathname === "/") {
      setLocaleState("es");
      setT(getTranslations("es"));
      setLocaleCookie("es");
    }
  }, [pathname]);

  /** On mount (non-main pages), sync from cookie so client preference wins. */
  useEffect(() => {
    if (pathname === "/") return;
    const cookieLocale = getLocaleFromCookie();
    if (cookieLocale && cookieLocale !== locale) {
      setLocaleState(cookieLocale);
      setT(getTranslations(cookieLocale));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run when pathname changes
  }, [pathname]);

  /** Sync when server sends a different defaultLocale; skip if cookie already overrides. */
  useEffect(() => {
    const cookieLocale = getLocaleFromCookie();
    if (cookieLocale && cookieLocale !== defaultLocale) return;
    if (defaultLocale !== locale) {
      setLocaleState(defaultLocale);
      setT(getTranslations(defaultLocale));
    }
  }, [defaultLocale, locale]);

  /** Detect Chrome (or other) "Translate to English" so we can show USD when page is translated and user hasn't chosen. */
  useEffect(() => {
    setChromeTranslatedToEnglish(detectChromeTranslatedToEnglish());
    const observer = new MutationObserver(() => {
      setChromeTranslatedToEnglish(detectChromeTranslatedToEnglish());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "class"],
    });
    return () => observer.disconnect();
  }, []);

  /** Currency follows app locale when user chose in footer; otherwise also "en" if Chrome translated. */
  const currencyLocale: Locale =
    userChoseLocale
      ? locale
      : (locale === "en" || chromeTranslatedToEnglish ? "en" : "es");

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, toggleLocale, currencyLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access translation context
 * Must be used within a LanguageProvider
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default LanguageProvider;
