/**
 * Server Actions for Clients
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { normalizePhoneForStorage } from "@/lib/phone";
import { logCreate, logUpdate, logDelete } from "@/lib/audit";
import type { ClientStatus, SubscriptionStatus, SingleChargeStatus, LineOfBusiness } from "@prisma/client";

/** Allowed image types for client logos (Vercel Blob). */
const LOGO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Uploads a client logo to Vercel Blob. Expects formData with "file" (File).
 * Returns the public blob URL or an error message.
 * Requires BLOB_READ_WRITE_TOKEN (set when you add a Blob store in Vercel project Storage).
 */
export async function uploadClientLogo(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) return { error: "No file provided" };

  const type = (file.type || "").toLowerCase();
  if (!type || !LOGO_CONTENT_TYPES.includes(type)) {
    return { error: "Allowed types: JPEG, PNG, WebP, SVG" };
  }
  if (file.size > LOGO_MAX_BYTES) return { error: "Logo must be under 2 MB" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const slug = file.name.replace(/\.[^.]+$/, "").replace(/\W+/g, "-").slice(0, 30) || "logo";
  const pathname = `client-logos/${Date.now()}-${slug}.${ext}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return { url: blob.url };
  } catch (e) {
    console.error("Vercel Blob upload failed:", e);
    return { error: "Upload failed. Check BLOB_READ_WRITE_TOKEN." };
  }
}

/**
 * Creates a new client (direct entry, not from lead).
 */
export async function createClient(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const company = formData.get("company") as string | null;
  const phone = formData.get("phone") as string | null;
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim() || null;
  const adminPortalUrl = (formData.get("adminPortalUrl") as string)?.trim() || null;
  const showOnWebsite = formData.get("showOnWebsite") === "on";
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const cedula = formData.get("cedula") as string | null;
  const rnc = formData.get("rnc") as string | null;
  const notes = formData.get("notes") as string | null;
  const lineOfBusinessRaw = formData.get("lineOfBusiness") as string | null;
  const lineOfBusiness: LineOfBusiness | null =
    lineOfBusinessRaw && ["retail", "tourism", "medical", "restaurant", "administrative", "warehouse_logistics"].includes(lineOfBusinessRaw)
      ? (lineOfBusinessRaw as LineOfBusiness)
      : null;

  if (!name || !email) throw new Error("Name and email are required");

  const client = await prisma.client.create({
    data: {
      name,
      email,
      company: company || null,
      phone: normalizePhoneForStorage(phone),
      lineOfBusiness,
      websiteUrl: websiteUrl || null,
      adminPortalUrl: adminPortalUrl || null,
      showOnWebsite,
      logoUrl,
      cedula: cedula || null,
      rnc: rnc || null,
      notes: notes || null,
      status: "active",
    },
  });

  await logCreate(session.id, "client", client.id, { name, email });

  revalidatePath("/dashboard/clients");
  revalidatePath("/");
  redirect(`/dashboard/clients/${client.id}`);
}

/**
 * Updates a client's details.
 * Expects formData to include clientId (hidden input) plus name, email, etc.
 */
export async function updateClient(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const clientId = formData.get("clientId") as string;
  if (!clientId) throw new Error("Client ID required");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  const statusRaw = formData.get("status") as string | null;
  const validStatuses: ClientStatus[] = ["active", "inactive", "churned"];
  const status = statusRaw && validStatuses.includes(statusRaw as ClientStatus)
    ? (statusRaw as ClientStatus)
    : undefined;

  const lineOfBusinessRaw = (formData.get("lineOfBusiness") as string)?.trim() || null;
  const lineOfBusiness: LineOfBusiness | null =
    lineOfBusinessRaw && ["retail", "tourism", "medical", "restaurant", "administrative", "warehouse_logistics"].includes(lineOfBusinessRaw)
      ? (lineOfBusinessRaw as LineOfBusiness)
      : null;

  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    company: (formData.get("company") as string)?.trim() || null,
    phone: normalizePhoneForStorage((formData.get("phone") as string)?.trim()),
    lineOfBusiness,
    websiteUrl: (formData.get("websiteUrl") as string)?.trim() || null,
    adminPortalUrl: (formData.get("adminPortalUrl") as string)?.trim() || null,
    showOnWebsite: formData.get("showOnWebsite") === "on",
    logoUrl: (formData.get("logoUrl") as string)?.trim() || null,
    cedula: (formData.get("cedula") as string)?.trim() || null,
    rnc: (formData.get("rnc") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
    ...(status !== undefined && { status }),
  };

  const updated = await prisma.client.update({
    where: { id: clientId },
    data,
  });

  await logUpdate(session.id, "client", clientId,
    { name: client.name, status: client.status },
    { name: data.name, status: data.status }
  );

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/");
  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Updates a client's status.
 */
export async function updateClientStatus(clientId: string, status: ClientStatus) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: { status },
  });

  await logUpdate(session.id, "client", clientId,
    { status: client.status },
    { status }
  );

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return updated;
}

/**
 * Updates only the client's logo URL (e.g. after uploading to Vercel Blob).
 */
export async function updateClientLogo(clientId: string, logoUrl: string | null) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  await prisma.client.update({
    where: { id: clientId },
    data: { logoUrl },
  });

  await logUpdate(session.id, "client", clientId,
    { logoUrl: client.logoUrl },
    { logoUrl }
  );

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/");
}

/**
 * Toggles whether a client is shown on the main website showcase.
 */
export async function updateClientShowOnWebsite(clientId: string, showOnWebsite: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  await prisma.client.update({
    where: { id: clientId },
    data: { showOnWebsite },
  });

  await logUpdate(session.id, "client", clientId,
    { showOnWebsite: client.showOnWebsite },
    { showOnWebsite }
  );

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/");
}

/**
 * Creates a subscription for a client.
 * Expects formData to include clientId (hidden) plus serviceId, amount, currency, billingCycle, startDate.
 */
export async function createSubscription(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const clientId = formData.get("clientId") as string;
  if (!clientId) throw new Error("Client ID required");

  const serviceId = formData.get("serviceId") as string;
  const amountRaw = formData.get("amount") as string;
  const currency = formData.get("currency") as "DOP" | "USD";
  const billingCycle = formData.get("billingCycle") as "monthly" | "quarterly" | "annual" | "one_time";
  const startDateRaw = formData.get("startDate") as string;

  if (!serviceId) throw new Error("Service is required");
  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount < 0) throw new Error("Valid amount is required");
  const validCurrencies = ["DOP", "USD"] as const;
  if (!validCurrencies.includes(currency)) throw new Error("Currency must be DOP or USD");
  const validCycles = ["monthly", "quarterly", "annual", "one_time"] as const;
  if (!validCycles.includes(billingCycle)) throw new Error("Invalid billing cycle");
  const startDate = new Date(startDateRaw);
  if (Number.isNaN(startDate.getTime())) throw new Error("Valid start date is required");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) throw new Error("Service not found or inactive");

  const subscription = await prisma.clientSubscription.create({
    data: {
      clientId,
      serviceId,
      amount,
      currency,
      billingCycle,
      startDate,
      status: "active",
    },
  });

  await logCreate(session.id, "subscription", subscription.id, {
    clientId,
    serviceId,
    amount,
  });

  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Updates a client subscription.
 * Expects formData: subscriptionId, clientId, serviceId, amount, currency, billingCycle, startDate, endDate (optional), status.
 */
export async function updateSubscription(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const subscriptionId = formData.get("subscriptionId") as string;
  const clientId = formData.get("clientId") as string;
  if (!subscriptionId || !clientId) throw new Error("Subscription ID and client ID required");

  const subscription = await prisma.clientSubscription.findUnique({
    where: { id: subscriptionId },
    include: { client: true },
  });
  if (!subscription || subscription.clientId !== clientId) throw new Error("Subscription not found");

  const serviceId = formData.get("serviceId") as string;
  const amountRaw = formData.get("amount") as string;
  const currency = formData.get("currency") as "DOP" | "USD";
  const billingCycle = formData.get("billingCycle") as "monthly" | "quarterly" | "annual" | "one_time";
  const startDateRaw = formData.get("startDate") as string;
  const endDateRaw = (formData.get("endDate") as string)?.trim() || null;
  const statusRaw = formData.get("status") as string;

  if (!serviceId) throw new Error("Service is required");
  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount < 0) throw new Error("Valid amount is required");
  const validCurrencies = ["DOP", "USD"] as const;
  if (!validCurrencies.includes(currency)) throw new Error("Currency must be DOP or USD");
  const validCycles = ["monthly", "quarterly", "annual", "one_time"] as const;
  if (!validCycles.includes(billingCycle)) throw new Error("Invalid billing cycle");
  const startDate = new Date(startDateRaw);
  if (Number.isNaN(startDate.getTime())) throw new Error("Valid start date is required");
  const endDate = endDateRaw ? new Date(endDateRaw) : null;
  if (endDate !== null && Number.isNaN(endDate.getTime())) throw new Error("Invalid end date");
  const validStatuses: SubscriptionStatus[] = ["active", "paused", "cancelled", "expired"];
  const status = validStatuses.includes(statusRaw as SubscriptionStatus)
    ? (statusRaw as SubscriptionStatus)
    : subscription.status;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) throw new Error("Service not found or inactive");

  await prisma.clientSubscription.update({
    where: { id: subscriptionId },
    data: {
      serviceId,
      amount,
      currency,
      billingCycle,
      startDate,
      endDate,
      status,
    },
  });

  await logUpdate(session.id, "subscription", subscriptionId,
    { amount: Number(subscription.amount), status: subscription.status },
    { amount, status }
  );

  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Deletes a client subscription (cascades to schedules and payments).
 */
export async function deleteSubscription(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const subscriptionId = formData.get("subscriptionId") as string;
  const clientId = formData.get("clientId") as string;
  if (!subscriptionId || !clientId) throw new Error("Subscription ID and client ID required");

  const subscription = await prisma.clientSubscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!subscription || subscription.clientId !== clientId) throw new Error("Subscription not found");

  await prisma.clientSubscription.delete({ where: { id: subscriptionId } });
  await logDelete(session.id, "subscription", subscriptionId);

  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Creates a single (one-time) charge for a client.
 * Expects formData: clientId, description, amount, currency, chargedAt (optional), status (optional), notes (optional).
 */
export async function createSingleCharge(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const clientId = formData.get("clientId") as string;
  if (!clientId) throw new Error("Client ID required");

  const description = (formData.get("description") as string)?.trim();
  if (!description) throw new Error("Description is required");

  const amountRaw = formData.get("amount") as string;
  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount < 0) throw new Error("Valid amount is required");

  const currency = formData.get("currency") as "DOP" | "USD";
  const validCurrencies = ["DOP", "USD"] as const;
  if (!validCurrencies.includes(currency)) throw new Error("Currency must be DOP or USD");

  const chargedAtRaw = (formData.get("chargedAt") as string)?.trim() || null;
  const chargedAt = chargedAtRaw ? new Date(chargedAtRaw) : new Date();
  if (Number.isNaN(chargedAt.getTime())) throw new Error("Invalid charge date");

  const statusRaw = (formData.get("status") as string)?.trim() || "pending";
  const validStatuses: SingleChargeStatus[] = ["pending", "paid", "cancelled"];
  const status = validStatuses.includes(statusRaw as SingleChargeStatus)
    ? (statusRaw as SingleChargeStatus)
    : "pending";

  const notes = (formData.get("notes") as string)?.trim() || null;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  const singleCharge = await prisma.singleCharge.create({
    data: {
      clientId,
      description,
      amount,
      currency,
      chargedAt,
      status,
      notes,
    },
  });

  await logCreate(session.id, "single_charge", singleCharge.id, { description, amount, clientId });

  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Updates a single charge. Expects formData: singleChargeId, clientId, description, amount, currency, chargedAt, status, notes (optional).
 */
export async function updateSingleCharge(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const singleChargeId = formData.get("singleChargeId") as string;
  const clientId = formData.get("clientId") as string;
  if (!singleChargeId || !clientId) throw new Error("Single charge ID and client ID required");

  const charge = await prisma.singleCharge.findUnique({
    where: { id: singleChargeId },
  });
  if (!charge || charge.clientId !== clientId) throw new Error("Single charge not found");

  const description = (formData.get("description") as string)?.trim();
  if (!description) throw new Error("Description is required");

  const amountRaw = formData.get("amount") as string;
  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount < 0) throw new Error("Valid amount is required");

  const currency = formData.get("currency") as "DOP" | "USD";
  const validCurrencies = ["DOP", "USD"] as const;
  if (!validCurrencies.includes(currency)) throw new Error("Currency must be DOP or USD");

  const chargedAtRaw = formData.get("chargedAt") as string;
  const chargedAt = new Date(chargedAtRaw);
  if (Number.isNaN(chargedAt.getTime())) throw new Error("Valid charge date is required");

  const statusRaw = formData.get("status") as string;
  const validStatuses: SingleChargeStatus[] = ["pending", "paid", "cancelled"];
  const status = validStatuses.includes(statusRaw as SingleChargeStatus)
    ? (statusRaw as SingleChargeStatus)
    : charge.status;

  const notes = (formData.get("notes") as string)?.trim() || null;

  await prisma.singleCharge.update({
    where: { id: singleChargeId },
    data: { description, amount, currency, chargedAt, status, notes },
  });

  await logUpdate(session.id, "single_charge", singleChargeId,
    { description: charge.description, amount: Number(charge.amount), status: charge.status },
    { description, amount, status }
  );

  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Deletes a single charge. Expects formData: singleChargeId, clientId.
 */
export async function deleteSingleCharge(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const singleChargeId = formData.get("singleChargeId") as string;
  const clientId = formData.get("clientId") as string;
  if (!singleChargeId || !clientId) throw new Error("Single charge ID and client ID required");

  const charge = await prisma.singleCharge.findUnique({
    where: { id: singleChargeId },
  });
  if (!charge || charge.clientId !== clientId) throw new Error("Single charge not found");

  await prisma.singleCharge.delete({ where: { id: singleChargeId } });
  await logDelete(session.id, "single_charge", singleChargeId);

  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Creates an additional contact for a client. Form must include clientId (hidden).
 */
export async function createClientContact(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const clientId = formData.get("clientId") as string;
  if (!clientId) throw new Error("Client ID required");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Contact name is required");

  const contact = await prisma.clientContact.create({
    data: {
      clientId,
      name,
      title: (formData.get("title") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: normalizePhoneForStorage(formData.get("phone") as string),
    },
  });

  await logCreate(session.id, "client_contact", contact.id, { name, clientId });

  revalidatePath(`/dashboard/clients/${clientId}`);
}

/**
 * Updates a client contact. Expects formData: contactId, clientId, name, title (optional), email (optional), phone (optional).
 */
export async function updateClientContact(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const contactId = formData.get("contactId") as string;
  const clientId = formData.get("clientId") as string;
  if (!contactId || !clientId) throw new Error("Contact ID and client ID required");

  const contact = await prisma.clientContact.findUnique({
    where: { id: contactId },
  });
  if (!contact || contact.clientId !== clientId) throw new Error("Contact not found");

  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Contact name is required");

  await prisma.clientContact.update({
    where: { id: contactId },
    data: {
      name,
      title: (formData.get("title") as string)?.trim() || null,
      email: (formData.get("email") as string)?.trim() || null,
      phone: normalizePhoneForStorage((formData.get("phone") as string)?.trim()),
    },
  });

  await logUpdate(session.id, "client_contact", contactId, { name: contact.name }, { name });

  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}

/**
 * Deletes a client contact. Call with formData containing contactId and clientId.
 */
export async function deleteClientContact(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const contactId = formData.get("contactId") as string;
  const clientId = formData.get("clientId") as string;
  if (!contactId || !clientId) throw new Error("Missing contactId or clientId");

  await prisma.clientContact.delete({
    where: { id: contactId },
  });

  revalidatePath(`/dashboard/clients/${clientId}`);
  redirect(`/dashboard/clients/${clientId}`);
}
