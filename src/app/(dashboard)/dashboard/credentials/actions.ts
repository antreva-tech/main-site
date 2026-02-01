/**
 * Server Actions for Credentials
 * SOC 2: All decrypt operations are logged.
 */

"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import { logCredentialDecrypt } from "@/lib/audit";

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
