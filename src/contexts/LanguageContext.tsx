"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { type Locale, type Translations, getTranslations } from "@/i18n";

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
 * Language provider component
 * Wraps the app and provides translation context
 * Defaults to Spanish (es)
 */
export function LanguageProvider({
  children,
  defaultLocale = "es",
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [t, setT] = useState<Translations>(getTranslations(defaultLocale));

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setT(getTranslations(newLocale));
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale = locale === "es" ? "en" : "es";
    setLocale(newLocale);
  }, [locale, setLocale]);

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
