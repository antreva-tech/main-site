/**
 * Server Actions for Pipeline (Leads)
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { normalizePhoneForStorage } from "@/lib/phone";
import { logCreate, logUpdate, logDelete } from "@/lib/audit";
import type { LeadStage, LeadSource } from "@prisma/client";

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
  notes: string | null;
  lostReason: string | null;
  expectedValue: unknown;
  createdAt: Date;
  updatedAt: Date;
  convertedClientId: string | null;
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
    notes: lead.notes,
    lostReason: lead.lostReason,
    expectedValue: lead.expectedValue != null ? Number(lead.expectedValue) : null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    convertedClientId: lead.convertedClientId,
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

  const base = {
    name: formData.get("name") as string,
    email: (formData.get("email") as string) || null,
    company: (formData.get("company") as string) || null,
    phone: normalizePhoneForStorage(formData.get("phone") as string),
    source,
    sourceOther: source === "other" ? sourceOther : null,
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
 * Converts a won lead to a client.
 */
export async function convertLeadToClient(leadId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");
  if (lead.convertedClientId) throw new Error("Lead already converted");

  const cedula = formData.get("cedula") as string | null;
  const rnc = formData.get("rnc") as string | null;

  // Create client from lead data (lead.phone already normalized when lead was created/updated)
  const client = await prisma.client.create({
    data: {
      leadId: lead.id,
      name: lead.name,
      email: lead.email || `${lead.id}@placeholder.local`, // Email required
      company: lead.company,
      phone: normalizePhoneForStorage(lead.phone),
      cedula: cedula || null,
      rnc: rnc || null,
      notes: lead.notes,
      status: "active",
    },
  });

  // Update lead with conversion info
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      stage: "won",
      convertedClientId: client.id,
    },
  });

  await logCreate(session.id, "client", client.id, {
    name: client.name,
    convertedFromLead: leadId,
  });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/clients");
  return { id: client.id, name: client.name };
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
