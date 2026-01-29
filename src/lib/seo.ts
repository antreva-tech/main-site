/**
 * SEO and AI-discoverability constants.
 * Single source for canonical URL and shared metadata (DRY).
 */

/** Canonical site URL. Override with NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) ||
  "https://www.antrevatech.com";

/** Organization name for schema and meta */
export const SITE_NAME = "Antreva Tech";

/** Default locale for metadata and JSON-LD */
export const DEFAULT_LOCALE = "es";

/** Supported locales for alternates */
export const LOCALES = ["es", "en"] as const;
