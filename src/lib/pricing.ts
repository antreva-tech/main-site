/**
 * Marketing-site pricing: DOP amounts and USD display conversion.
 * Used so main site can show RD$ in Spanish and USD in English.
 */

/** Approximate DOP per 1 USD for display. Update periodically. */
export const DOP_PER_USD = 60;

/**
 * Converts DOP amount to USD (for display only).
 * @param amountDop - Amount in Dominican pesos
 * @returns Equivalent USD number
 */
export function dopToUsd(amountDop: number): number {
  return amountDop / DOP_PER_USD;
}

/**
 * Formats a plan price for display in the given currency.
 * @param amountDop - Base price in DOP (e.g. 4500, 7500, 12000)
 * @param currency - "DOP" for RD$, "USD" for $
 * @param options - plus: append "+" (e.g. "12,000+")
 * @returns Formatted string e.g. "RD$4,500" or "$75"
 */
export function formatPlanPrice(
  amountDop: number,
  currency: "DOP" | "USD",
  options?: { plus?: boolean }
): string {
  const plus = options?.plus ?? false;
  if (currency === "DOP") {
    const s = amountDop.toLocaleString("es-DO");
    return plus ? `RD$${s}+` : `RD$${s}`;
  }
  const usd = Math.round(dopToUsd(amountDop));
  const s = usd.toLocaleString("en-US");
  return plus ? `$${s}+` : `$${s}`;
}
