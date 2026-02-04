"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/** Variant: "light" for white/light headers, "dark" for dark headers. */
interface LanguageSwitcherProps {
  variant?: "light" | "dark";
  /** When set (e.g. in dashboard), persist chosen locale to the user account. */
  onLocaleChange?: (
    locale: "es" | "en"
  ) => void | Promise<void | { success?: boolean; error?: string }>;
}

/** Spain flag: red-yellow-red horizontal stripes. */
function FlagES({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 18" className={className} aria-hidden>
      <rect width="24" height="6" fill="#AA151B" />
      <rect y="6" width="24" height="6" fill="#F1BF00" />
      <rect y="12" width="24" height="6" fill="#AA151B" />
    </svg>
  );
}

/** US flag: blue canton + red/white stripes (simplified for small size). */
function FlagEN({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 18" className={className} aria-hidden >
      <rect width="24" height="18" fill="#B22234" />
      <rect y="0" width="24" height="1.8" fill="#fff" />
      <rect y="3.6" width="24" height="1.8" fill="#fff" />
      <rect y="7.2" width="24" height="1.8" fill="#fff" />
      <rect y="10.8" width="24" height="1.8" fill="#fff" />
      <rect y="14.4" width="24" height="1.8" fill="#fff" />
      <rect width="9.6" height="7.56" fill="#3C3B6E" />
      <circle cx="2.4" cy="1.9" r="0.5" fill="#fff" />
      <circle cx="4.8" cy="1.9" r="0.5" fill="#fff" />
      <circle cx="7.2" cy="1.9" r="0.5" fill="#fff" />
      <circle cx="2.4" cy="3.78" r="0.5" fill="#fff" />
      <circle cx="4.8" cy="3.78" r="0.5" fill="#fff" />
      <circle cx="7.2" cy="3.78" r="0.5" fill="#fff" />
      <circle cx="2.4" cy="5.66" r="0.5" fill="#fff" />
      <circle cx="4.8" cy="5.66" r="0.5" fill="#fff" />
      <circle cx="7.2" cy="5.66" r="0.5" fill="#fff" />
    </svg>
  );
}

/** Flag-based language switcher: two flag buttons for Spanish and English. Uses SVG so flags render on desktop (Windows often omits flag emoji). */
export function LanguageSwitcher({ variant = "dark", onLocaleChange }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  const handleSelect = (loc: "es" | "en") => {
    setLocale(loc);
    onLocaleChange?.(loc);
  };

  const base =
    "flex items-center justify-center w-9 h-9 rounded-lg transition-colors border flex-shrink-0 overflow-hidden";
  const flagSize = "w-6 h-[18px]";
  const lightInactive =
    "bg-gray-100 hover:bg-gray-200 border-gray-200 opacity-70 hover:opacity-100";
  const lightActive =
    "bg-tech-blue/15 border-tech-blue ring-2 ring-tech-blue/30";
  const darkInactive =
    "bg-white/10 hover:bg-white/20 border-white/20 opacity-80 hover:opacity-100";
  const darkActive =
    "bg-white/25 border-white/40 ring-2 ring-white/40";

  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-1 flex-shrink-0" role="group" aria-label="Language">
      {(["es", "en"] as const).map((loc) => {
        const isActive = locale === loc;
        const label = loc === "es" ? "Español" : "English";
        return (
          <button
            key={loc}
            type="button"
            onClick={() => handleSelect(loc)}
            aria-label={label}
            aria-current={isActive ? "true" : undefined}
            className={`${base} ${
              isActive
                ? isLight
                  ? lightActive
                  : darkActive
                : isLight
                  ? lightInactive
                  : darkInactive
            }`}
          >
            {loc === "es" ? (
              <FlagES className={flagSize} />
            ) : (
              <FlagEN className={flagSize} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default LanguageSwitcher;
