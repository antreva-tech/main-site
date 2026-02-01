"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/** Variant: "light" for white/light headers (e.g. dashboard), "dark" for dark headers (e.g. marketing). */
interface LanguageSwitcherProps {
  variant?: "light" | "dark";
}

/**
 * Language switcher button component.
 * Toggles between Spanish and English.
 */
export function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const { locale, toggleLocale, t } = useLanguage();

  const base = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
  const lightClass =
    "bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800";
  const darkClass =
    "bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white";

  return (
    <button
      onClick={toggleLocale}
      className={`${base} ${variant === "light" ? lightClass : darkClass}`}
      aria-label={`Switch to ${locale === "es" ? "English" : "Spanish"}`}
    >
      <span className="text-base">{locale === "es" ? "🇺🇸" : "🇪🇸"}</span>
      <span>{t.language.switch}</span>
    </button>
  );
}

export default LanguageSwitcher;
