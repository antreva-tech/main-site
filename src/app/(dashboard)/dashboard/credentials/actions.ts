/**
 * Server Actions for Credentials
 * SOC 2: All decrypt operations are logged.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { decrypt, encrypt } from "@/lib/encryption";
import { logCredentialDecrypt, logCreate, logUpdate, logDelete } from "@/lib/audit";

/**
 * Decrypts a credential value.
 * Requires credentials.decrypt permission.
 * Logs the access for SOC 2 compliance.
 */
export async function decryptCredential(
  credentialId: string,
  label: string
): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  if (!session.permissions.includes("credentials.decrypt")) {
    throw new Error("Permission denied: credentials.decrypt");
  }

  const credential = await prisma.supportCredential.findUnique({
    where: { id: credentialId },
  });

  if (!credential) {
    throw new Error("Credential not found");
  }

  // Log the decrypt operation (SOC 2)
  await logCredentialDecrypt(session.id, credentialId, label);

  // Decrypt and return
  return decrypt(credential.encryptedValue, credential.iv);
}

/**
 * Creates an encrypted support credential for a client (e.g. admin panel login).
 * Value is encrypted at rest; decrypt is logged for SOC 2.
 */
export async function createCredential(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const clientId = formData.get("clientId") as string;
  const label = (formData.get("label") as string)?.trim();
  const value = formData.get("value") as string;

  if (!clientId || !label || !value) {
    throw new Error("Client, label, and value are required");
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  const { encrypted, iv } = encrypt(value);

  const credential = await prisma.supportCredential.create({
    data: {
      clientId,
      label,
      encryptedValue: encrypted,
      iv,
    },
  });

  await logCreate(session.id, "credential", credential.id, { clientId, label });

  revalidatePath("/dashboard/credentials");
  revalidatePath(`/dashboard/clients/${clientId}`);
}

/**
 * Updates a credential's label and/or value.
 * Value is optional; if provided, re-encrypts and updates. Label always updatable.
 */
export async function updateCredential(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const credentialId = formData.get("credentialId") as string;
  const clientId = formData.get("clientId") as string;
  const label = (formData.get("label") as string)?.trim();
  const newValue = formData.get("value") as string | null;

  if (!credentialId || !clientId || !label) {
    throw new Error("Credential ID, client ID, and label are required");
  }

  const credential = await prisma.supportCredential.findUnique({
    where: { id: credentialId },
  });
  if (!credential) throw new Error("Credential not found");
  if (credential.clientId !== clientId) throw new Error("Client mismatch");

  const updateData: { label: string; encryptedValue?: string; iv?: string } = { label };
  if (newValue != null && newValue !== "") {
    const { encrypted, iv } = encrypt(newValue);
    updateData.encryptedValue = encrypted;
    updateData.iv = iv;
  }

  await prisma.supportCredential.update({
    where: { id: credentialId },
    data: updateData,
  });

  await logUpdate(session.id, "credential", credentialId, { label: credential.label }, { label });

  revalidatePath("/dashboard/credentials");
  revalidatePath(`/dashboard/clients/${clientId}`);
}

/**
 * Deletes a support credential.
 */
export async function deleteCredential(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const credentialId = formData.get("credentialId") as string;
  const clientId = formData.get("clientId") as string;
  if (!credentialId || !clientId) throw new Error("Credential ID and client ID required");

  const credential = await prisma.supportCredential.findUnique({
    where: { id: credentialId },
  });
  if (!credential) throw new Error("Credential not found");
  if (credential.clientId !== clientId) throw new Error("Client mismatch");

  await prisma.supportCredential.delete({ where: { id: credentialId } });
  await logDelete(session.id, "credential", credentialId, { label: credential.label });

  revalidatePath("/dashboard/credentials");
  revalidatePath(`/dashboard/clients/${clientId}`);
}
