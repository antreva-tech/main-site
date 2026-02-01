/**
 * Phone number normalization for storage (US/DR +1).
 * Ensures +1 is prepended when user does not enter it.
 */

/**
 * Normalizes a phone value for storage: trims, and if the value does not
 * start with "+", prepends "+1" and strips non-digits from the remainder.
 * Returns null for null, empty, or whitespace-only input.
 *
 * @param phone - Raw phone string from form or API
 * @returns Normalized string (e.g. "+18095551234") or null
 */
export function normalizePhoneForStorage(phone: string | null | undefined): string | null {
  if (phone == null) return null;
  const trimmed = String(phone).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits.length) return null;
  return `+1${digits}`;
}
