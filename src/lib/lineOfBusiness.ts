/**
 * Line of business / industry options for leads and clients.
 * Ordered list for consistent dropdowns; labels come from i18n (dashboard.common.lineOfBusinessOptions).
 */

import type { LineOfBusiness } from "@/generated/prisma/client";

/** All line-of-business enum values in display order. */
export const LINE_OF_BUSINESS_VALUES: LineOfBusiness[] = [
  "retail",
  "tourism",
  "medical",
  "restaurant",
  "administrative",
  "warehouse_logistics",
];

/** English labels for server-side or fallback display. */
export const LINE_OF_BUSINESS_LABELS: Record<LineOfBusiness, string> = {
  retail: "Retail",
  tourism: "Tourism",
  medical: "Medical",
  restaurant: "Restaurant",
  administrative: "Administrative",
  warehouse_logistics: "Warehouse / Logistics",
};

/** Returns display label for a line-of-business value (server-safe, English). */
export function formatLineOfBusiness(value: string | null): string {
  if (!value) return "—";
  return LINE_OF_BUSINESS_LABELS[value as LineOfBusiness] ?? value.replace(/_/g, " ");
}
