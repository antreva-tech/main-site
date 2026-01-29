"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Language switcher button component
 * Toggles between Spanish and English
 */
export function LanguageSwitcher() {
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors text-sm font-medium border border-white/20"
      aria-label={`Switch to ${locale === "es" ? "English" : "Spanish"}`}
    >
      <span className="text-base">{locale === "es" ? "🇺🇸" : "🇪🇸"}</span>
      <span>{t.language.switch}</span>
    </button>
  );
}

export default LanguageSwitcher;
