/**
 * Server Actions for Clients
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logCreate, logUpdate, logDelete } from "@/lib/audit";
import type { ClientStatus } from "@prisma/client";

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
  const cedula = formData.get("cedula") as string | null;
  const rnc = formData.get("rnc") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!name || !email) throw new Error("Name and email are required");

  const client = await prisma.client.create({
    data: {
      name,
      email,
      company: company || null,
      phone: phone || null,
      cedula: cedula || null,
      rnc: rnc || null,
      notes: notes || null,
      status: "active",
    },
  });

  await logCreate(session.id, "client", client.id, { name, email });

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients/${client.id}`);
}

/**
 * Updates a client's details.
 */
export async function updateClient(clientId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    company: formData.get("company") as string | null,
    phone: formData.get("phone") as string | null,
    cedula: formData.get("cedula") as string | null,
    rnc: formData.get("rnc") as string | null,
    notes: formData.get("notes") as string | null,
  };

  const updated = await prisma.client.update({
    where: { id: clientId },
    data,
  });

  await logUpdate(session.id, "client", clientId, 
    { name: client.name }, 
    { name: data.name }
  );

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return updated;
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
 * Creates a subscription for a client.
 */
export async function createSubscription(clientId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const serviceId = formData.get("serviceId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = formData.get("currency") as "DOP" | "USD";
  const billingCycle = formData.get("billingCycle") as "monthly" | "quarterly" | "annual" | "one_time";
  const startDate = new Date(formData.get("startDate") as string);

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
  return subscription;
}
