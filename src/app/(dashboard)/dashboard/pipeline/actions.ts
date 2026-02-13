/**
 * Server Actions for Pipeline (Leads)
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { normalizePhoneForStorage } from "@/lib/phone";
import { logCreate, logUpdate, logDelete } from "@/lib/audit";
import type { LeadStage, LeadSource, LineOfBusiness, PaymentHandling } from "@prisma/client";
import { getMissingIntakeFields, buildIntakeSnapshot, PAYMENT_HANDLING_VALUES } from "./intakeHelpers";

/** Valid lead stages for form/API. */
const LEAD_STAGES: LeadStage[] = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

/**
 * Serializes a Prisma lead to a plain object for client (no Decimal/Date).
 * Includes intake and logo fields.
 */
function serializeLead(lead: {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  stage: string;
  source: string;
  sourceOther: string | null;
  referralFrom: string | null;
  lineOfBusiness: string | null;
  notes: string | null;
  lostReason: string | null;
  expectedValue: unknown;
  createdAt: Date;
  updatedAt: Date;
  convertedClientId: string | null;
  // Intake fields (company and phone are the existing Lead fields)
  hasLogo?: boolean;
  logoBlobUrl?: string | null;
  logoDownloadUrl?: string | null;
  logoPathname?: string | null;
  logoContentType?: string | null;
  logoSize?: number | null;
  hasDomain?: boolean;
  domain?: string | null;
  addressToUse?: string | null;
  whatsappEnabled?: boolean;
  businessDescription?: string | null;
  serviceOutcome?: string | null;
  adminEaseNotes?: string | null;
  paymentHandling?: string | null;
  wonAt?: Date | null;
}) {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    stage: lead.stage,
    source: lead.source,
    sourceOther: lead.sourceOther,
    referralFrom: lead.referralFrom,
    lineOfBusiness: lead.lineOfBusiness,
    notes: lead.notes,
    lostReason: lead.lostReason,
    expectedValue: lead.expectedValue != null ? Number(lead.expectedValue) : null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    convertedClientId: lead.convertedClientId,
    // Intake fields (company and phone already serialized above)
    hasLogo: lead.hasLogo ?? false,
    logoBlobUrl: lead.logoBlobUrl ?? null,
    logoDownloadUrl: lead.logoDownloadUrl ?? null,
    logoPathname: lead.logoPathname ?? null,
    logoContentType: lead.logoContentType ?? null,
    logoSize: lead.logoSize ?? null,
    hasDomain: lead.hasDomain ?? false,
    domain: lead.domain ?? null,
    addressToUse: lead.addressToUse ?? null,
    whatsappEnabled: lead.whatsappEnabled ?? false,
    businessDescription: lead.businessDescription ?? null,
    serviceOutcome: lead.serviceOutcome ?? null,
    adminEaseNotes: lead.adminEaseNotes ?? null,
    paymentHandling: lead.paymentHandling ?? null,
    wonAt: lead.wonAt?.toISOString() ?? null,
  };
}

/**
 * Creates a new lead.
 */
export async function createLead(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string | null;
  const company = formData.get("company") as string | null;
  const phone = formData.get("phone") as string | null;
  const source = (formData.get("source") as LeadSource) || "other";
  const sourceOther = (formData.get("sourceOther") as string) || null;
  const referralFrom = (formData.get("referralFrom") as string) || null;
  const lineOfBusinessRaw = formData.get("lineOfBusiness") as string | null;
  const lineOfBusiness: LineOfBusiness | null =
    lineOfBusinessRaw && ["retail", "tourism", "medical", "restaurant", "administrative", "warehouse_logistics"].includes(lineOfBusinessRaw)
      ? (lineOfBusinessRaw as LineOfBusiness)
      : null;
  const notes = formData.get("notes") as string | null;
  const expectedValue = formData.get("expectedValue") as string | null;

  if (!name) throw new Error("Name is required");

  const lead = await prisma.lead.create({
    data: {
      name,
      email: email || null,
      company: company || null,
      phone: normalizePhoneForStorage(phone),
      source,
      sourceOther: source === "other" ? sourceOther : null,
      referralFrom: source === "referral" ? (referralFrom?.trim() || null) : null,
      lineOfBusiness,
      notes: notes || null,
      expectedValue: expectedValue ? parseFloat(expectedValue) : null,
      stage: "new",
    },
  });

  await logCreate(session.id, "lead", lead.id, {
    name,
    email,
    company,
    source,
  });

  revalidatePath("/dashboard/pipeline");
  return serializeLead(lead);
}

/**
 * Updates a lead's stage.
 * Won is final: once a lead is won, stage cannot be changed.
 * Moving to won is only allowed via convertLeadToClient (convert workflow).
 */
export async function updateLeadStage(leadId: string, stage: LeadStage) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  if (lead.stage === "won") {
    throw new Error("Once won, lead stage cannot be changed.");
  }
  if (stage === "won") {
    throw new Error("To win this lead, use Convert to Client from the card or pipeline.");
  }

  const oldStage = lead.stage;

  await prisma.lead.update({
    where: { id: leadId },
    data: { stage },
  });

  await logUpdate(session.id, "lead", leadId, { stage: oldStage }, { stage });

  revalidatePath("/dashboard/pipeline");
}

/**
 * Updates a lead's details (including stage when provided in formData).
 */
export async function updateLead(leadId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const stageRaw = formData.get("stage") as string | null;
  const stage: LeadStage | undefined =
    stageRaw && LEAD_STAGES.includes(stageRaw as LeadStage)
      ? (stageRaw as LeadStage)
      : undefined;

  const source = (formData.get("source") as LeadSource) || lead.source;
  const sourceOther = (formData.get("sourceOther") as string) || null;
  const referralFromRaw = (formData.get("referralFrom") as string) || null;
  const referralFrom = source === "referral" ? (referralFromRaw?.trim() || null) : null;
  const lineOfBusinessRaw = formData.get("lineOfBusiness") as string | null;
  const lineOfBusiness: LineOfBusiness | null =
    lineOfBusinessRaw && ["retail", "tourism", "medical", "restaurant", "administrative", "warehouse_logistics"].includes(lineOfBusinessRaw)
      ? (lineOfBusinessRaw as LineOfBusiness)
      : null;

  const base = {
    name: formData.get("name") as string,
    email: (formData.get("email") as string) || null,
    company: (formData.get("company") as string) || null,
    phone: normalizePhoneForStorage(formData.get("phone") as string),
    source,
    sourceOther: source === "other" ? sourceOther : null,
    referralFrom,
    lineOfBusiness,
    notes: (formData.get("notes") as string) || null,
    expectedValue: formData.get("expectedValue")
      ? parseFloat(formData.get("expectedValue") as string)
      : null,
    lostReason: (formData.get("lostReason") as string) || null,
  };
  // Once won, do not allow changing stage via edit form.
  const stageToApply =
    lead.stage === "won" ? undefined : stage != null ? stage : undefined;
  const data = stageToApply != null ? { ...base, stage: stageToApply } : base;

  await prisma.lead.update({
    where: { id: leadId },
    data,
  });

  await logUpdate(session.id, "lead", leadId, { name: lead.name }, { name: base.name });

  revalidatePath("/dashboard/pipeline");
  revalidatePath(`/dashboard/pipeline/${leadId}`);
}

/**
 * Saves intake fields on a lead record (called from IntakeModal before WON conversion).
 * Returns { error } on failure, undefined on success.
 */
export async function saveIntakeFields(
  leadId: string,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { error: "Lead not found" };

  const lineOfBusinessRaw = (formData.get("lineOfBusiness") as string)?.trim() || null;
  const lineOfBusiness: LineOfBusiness | null =
    lineOfBusinessRaw &&
    ["retail", "tourism", "medical", "restaurant", "administrative", "warehouse_logistics"].includes(lineOfBusinessRaw)
      ? (lineOfBusinessRaw as LineOfBusiness)
      : null;

  const paymentHandlingRaw = (formData.get("paymentHandling") as string)?.trim() || null;
  const paymentHandling: PaymentHandling | null =
    paymentHandlingRaw && (PAYMENT_HANDLING_VALUES as readonly string[]).includes(paymentHandlingRaw)
      ? (paymentHandlingRaw as PaymentHandling)
      : null;

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      company: (formData.get("company") as string)?.trim() || null,
      hasLogo: formData.get("hasLogo") === "true",
      logoBlobUrl: (formData.get("logoBlobUrl") as string)?.trim() || null,
      logoDownloadUrl: (formData.get("logoDownloadUrl") as string)?.trim() || null,
      logoContentType: (formData.get("logoContentType") as string)?.trim() || null,
      logoSize: formData.get("logoSize") ? parseInt(formData.get("logoSize") as string, 10) || null : null,
      hasDomain: formData.get("hasDomain") === "true",
      domain: (formData.get("domain") as string)?.trim() || null,
      addressToUse: (formData.get("addressToUse") as string)?.trim() || null,
      phone: normalizePhoneForStorage((formData.get("phone") as string)?.trim() || null),
      whatsappEnabled: formData.get("whatsappEnabled") === "true",
      businessDescription: (formData.get("businessDescription") as string)?.trim() || null,
      serviceOutcome: (formData.get("serviceOutcome") as string)?.trim() || null,
      adminEaseNotes: (formData.get("adminEaseNotes") as string)?.trim() || null,
      lineOfBusiness,
      paymentHandling,
    },
  });

  await logUpdate(session.id, "lead", leadId, { intake: "partial" }, { intake: "saved" });
  revalidatePath("/dashboard/pipeline");
  revalidatePath(`/dashboard/pipeline/${leadId}`);
  return undefined;
}

/**
 * Converts a lead to a client (WON transition).
 * Enforces intake completeness gate. On success, also creates a DevelopmentProject at DISCOVERY
 * with a full intake snapshot. Returns structured result for client handling.
 */
export async function convertLeadToClient(
  leadId: string,
  formData: FormData
): Promise<{
  id: string;
  name: string;
  devProjectId?: string;
  error?: string;
  code?: string;
  missingFields?: string[];
}> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (lead.convertedClientId) throw new Error("Lead already converted");

  // --- WON Gate: check intake completeness ---
  const missing = getMissingIntakeFields(lead);
  if (missing.length > 0) {
    return {
      id: "",
      name: "",
      error: "Intake fields are required before converting to WON.",
      code: "INTAKE_REQUIRED_FOR_WON",
      missingFields: missing,
    };
  }

  const cedula = formData.get("cedula") as string | null;
  const rnc = formData.get("rnc") as string | null;

  // --- Transaction: create client, set won, create dev project with snapshot ---
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create client from lead data (company and phone are the canonical fields)
    const client = await tx.client.create({
      data: {
        leadId: lead.id,
        name: lead.company || lead.name,
        email: lead.email || `${lead.id}@placeholder.local`,
        company: lead.company,
        phone: normalizePhoneForStorage(lead.phone),
        lineOfBusiness: lead.lineOfBusiness,
        cedula: cedula || null,
        rnc: rnc || null,
        notes: lead.notes,
        status: "active",
      },
    });

    // 2. Set lead to WON
    await tx.lead.update({
      where: { id: leadId },
      data: {
        stage: "won",
        wonAt: new Date(),
        convertedClientId: client.id,
      },
    });

    // 3. Create DevelopmentProject at discovery with intake snapshot (dedupe via unique leadId)
    const existingProject = await tx.developmentProject.findUnique({
      where: { clientId: client.id },
    });

    let devProject;
    if (!existingProject) {
      const snapshot = buildIntakeSnapshot(lead);
      devProject = await tx.developmentProject.create({
        data: {
          clientId: client.id,
          leadId: lead.id,
          stage: "discovery",
          notes: `${lead.company || lead.name} — Discovery`,
          ...snapshot,
        },
      });
    } else {
      devProject = existingProject;
    }

    return { client, devProject };
  });

  await logCreate(session.id, "client", result.client.id, {
    name: result.client.name,
    convertedFromLead: leadId,
  });

  if (result.devProject) {
    await logCreate(session.id, "development_project", result.devProject.id, {
      clientId: result.client.id,
      leadId,
      stage: "discovery",
    });
  }

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/development");
  return {
    id: result.client.id,
    name: result.client.name,
    devProjectId: result.devProject?.id,
  };
}

/**
 * Deletes a lead.
 */
export async function deleteLead(leadId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  await prisma.lead.delete({ where: { id: leadId } });

  await logDelete(session.id, "lead", leadId, { name: lead.name });

  revalidatePath("/dashboard/pipeline");
}
