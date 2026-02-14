/**
 * SSR-safe date formatting with fixed locale and options.
 * Use these instead of raw toLocaleString()/toLocaleDateString() to avoid
 * hydration mismatch when server and client have different locales.
 */

/**
 * Formats a date as date-only (e.g. "2/14/2026"). Same on server and client.
 */
export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

/**
 * Formats a date with time (e.g. "2/14/2026, 2:31:24 AM"). Same on server and client.
 */
export function formatDateTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}
