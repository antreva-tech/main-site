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

/** Path to logo used for OG/Twitter/WhatsApp link previews (relative to site root). */
export const OG_IMAGE_PATH = "/Antreva Tech Transparente.png";

/** Absolute URL for the preview image. Required for WhatsApp and some crawlers. */
export const OG_IMAGE_URL = `${SITE_URL}${encodeURI(OG_IMAGE_PATH)}`;
