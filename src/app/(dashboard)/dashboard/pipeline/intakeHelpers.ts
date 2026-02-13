/**
 * Shared helpers for WON intake validation and snapshot mapping.
 * Used by server-side gate (convertLeadToClient) and client-side error display.
 *
 * NOTE: "company" and "phone" are the canonical Lead fields reused for intake
 * (no separate businessName/phoneNumber columns).
 */

import type { PaymentHandling } from "@prisma/client";

/** Shape of intake fields on a Lead record (subset used for validation). */
export interface IntakeFields {
  company: string | null;
  phone: string | null;
  hasLogo: boolean;
  logoBlobUrl: string | null;
  logoDownloadUrl: string | null;
  hasDomain: boolean;
  domain: string | null;
  addressToUse: string | null;
  whatsappEnabled: boolean;
  businessDescription: string | null;
  serviceOutcome: string | null;
  adminEaseNotes: string | null;
  lineOfBusiness: string | null;
  paymentHandling: PaymentHandling | string | null;
  // Logo blob metadata (optional for validation but needed for snapshot)
  logoPathname?: string | null;
  logoContentType?: string | null;
  logoSize?: number | null;
}

/**
 * Returns an array of field names that are missing/incomplete for the WON gate.
 * Empty array means the lead is ready to transition to WON.
 */
export function getMissingIntakeFields(lead: IntakeFields): string[] {
  const missing: string[] = [];

  if (!lead.company?.trim()) missing.push("company");
  if (!lead.addressToUse?.trim()) missing.push("addressToUse");
  if (!lead.phone?.trim()) missing.push("phone");
  if (!lead.businessDescription?.trim()) missing.push("businessDescription");
  if (!lead.serviceOutcome?.trim()) missing.push("serviceOutcome");
  if (!lead.adminEaseNotes?.trim()) missing.push("adminEaseNotes");
  if (!lead.lineOfBusiness) missing.push("lineOfBusiness");
  if (!lead.paymentHandling) missing.push("paymentHandling");

  // Conditional: domain required when hasDomain is true
  if (lead.hasDomain && !lead.domain?.trim()) {
    missing.push("domain");
  }

  // Conditional: logo blob required when hasLogo is true
  if (lead.hasLogo && !lead.logoBlobUrl) {
    missing.push("logoBlobUrl");
  }

  return missing;
}

/**
 * Maps lead intake fields to the DevelopmentProject snapshot columns.
 * Returns a flat object ready for Prisma create/update.
 */
export function buildIntakeSnapshot(lead: IntakeFields) {
  return {
    intakeBusinessName: lead.company,
    intakeHasLogo: lead.hasLogo,
    intakeLogoBlobUrl: lead.logoBlobUrl,
    intakeLogoDownloadUrl: lead.logoDownloadUrl,
    intakeLogoPathname: lead.logoPathname ?? null,
    intakeLogoContentType: lead.logoContentType ?? null,
    intakeLogoSize: lead.logoSize ?? null,
    intakeHasDomain: lead.hasDomain,
    intakeDomain: lead.domain,
    intakeAddressToUse: lead.addressToUse,
    intakePhoneNumber: lead.phone,
    intakeWhatsappEnabled: lead.whatsappEnabled,
    intakeBusinessDescription: lead.businessDescription,
    intakeServiceOutcome: lead.serviceOutcome,
    intakeAdminEaseNotes: lead.adminEaseNotes,
    intakeLineOfBusiness: lead.lineOfBusiness,
    intakePaymentHandling: lead.paymentHandling as string | null,
  };
}

/** All PaymentHandling enum values for validation. */
export const PAYMENT_HANDLING_VALUES = [
  "CASH",
  "BANK_TRANSFER",
  "CARD",
  "MIXED",
] as const;
