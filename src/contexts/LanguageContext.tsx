"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { type Locale, type Translations, getTranslations } from "@/i18n";

const LOCALE_COOKIE = "locale";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

interface LanguageContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
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

/**
 * Language provider component.
 * Wraps the app and provides translation context. Defaults to Spanish (es).
 * Persists locale in a cookie when changed.
 */
export function LanguageProvider({
  children,
  defaultLocale = "es",
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [t, setT] = useState<Translations>(() => getTranslations(defaultLocale));

  const setLocale = useCallback((newLocale: Locale) => {
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

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
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
