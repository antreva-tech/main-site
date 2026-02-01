/**
 * Server Actions for Pipeline (Leads)
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
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
      phone: phone || null,
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
  return lead;
}

/**
 * Updates a lead's stage.
 */
export async function updateLeadStage(leadId: string, stage: LeadStage) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const oldStage = lead.stage;

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { stage },
  });

  await logUpdate(session.id, "lead", leadId, { stage: oldStage }, { stage });

  revalidatePath("/dashboard/pipeline");
  return updated;
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
    phone: (formData.get("phone") as string) || null,
    source,
    sourceOther: source === "other" ? sourceOther : null,
    notes: (formData.get("notes") as string) || null,
    expectedValue: formData.get("expectedValue")
      ? parseFloat(formData.get("expectedValue") as string)
      : null,
    lostReason: (formData.get("lostReason") as string) || null,
  };
  const data = stage != null ? { ...base, stage } : base;

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data,
  });

  await logUpdate(session.id, "lead", leadId, { name: lead.name }, { name: base.name });

  revalidatePath("/dashboard/pipeline");
  revalidatePath(`/dashboard/pipeline/${leadId}`);
  return updated;
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

  // Create client from lead data
  const client = await prisma.client.create({
    data: {
      leadId: lead.id,
      name: lead.name,
      email: lead.email || `${lead.id}@placeholder.local`, // Email required
      company: lead.company,
      phone: lead.phone,
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
  return client;
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
