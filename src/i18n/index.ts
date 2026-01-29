import es from "./es.json";
import en from "./en.json";

export type Locale = "es" | "en";

export const translations = {
  es,
  en,
} as const;

export type Translations = typeof es;

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export { es, en };
