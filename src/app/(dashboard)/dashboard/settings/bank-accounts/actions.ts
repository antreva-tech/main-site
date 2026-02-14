/**
 * Server Actions for Bank Accounts
 * Account numbers are encrypted at rest; only last 4 digits stored for display.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";

/** Last 4 digits for display (digits only from end of string). */
function getLast4(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.slice(-4) || "****";
}

/**
 * Creates a bank account. Expects formData: bankName, routingNumber (optional), accountNumber, accountType, currency, accountHolder.
 */
export async function createBankAccount(formData: FormData) {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    throw new Error("Unauthorized");
  }

  const bankName = (formData.get("bankName") as string)?.trim();
  const routingNumber = (formData.get("routingNumber") as string)?.trim() || null;
  const accountNumber = (formData.get("accountNumber") as string)?.trim();
  const accountType = formData.get("accountType") as "savings" | "checking";
  const currency = formData.get("currency") as "DOP" | "USD";
  const accountHolder = (formData.get("accountHolder") as string)?.trim();

  if (!bankName || !accountNumber || !accountHolder) {
    throw new Error("Bank name, account number, and account holder are required");
  }
  if (accountType !== "savings" && accountType !== "checking") {
    throw new Error("Account type must be savings or checking");
  }
  if (currency !== "DOP" && currency !== "USD") {
    throw new Error("Currency must be DOP or USD");
  }

  const { encrypted, iv } = encrypt(accountNumber);
  const accountNumberLast4 = getLast4(accountNumber);

  await prisma.bankAccount.create({
    data: {
      bankName,
      routingNumber,
      accountNumber: encrypted,
      accountNumberIv: iv,
      accountNumberLast4,
      accountType,
      currency,
      accountHolder,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/settings/bank-accounts");
  redirect("/dashboard/settings/bank-accounts");
}

/**
 * Updates a bank account. Expects formData: id, bankName, accountNumber (optional), accountType, currency, accountHolder, isActive.
 * If accountNumber is empty, existing encrypted value is kept.
 */
export async function updateBankAccount(formData: FormData) {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  if (!id) throw new Error("Bank account ID required");

  const account = await prisma.bankAccount.findUnique({ where: { id } });
  if (!account) throw new Error("Bank account not found");

  const bankName = (formData.get("bankName") as string)?.trim();
  const routingNumber = (formData.get("routingNumber") as string)?.trim() || null;
  const accountNumberRaw = (formData.get("accountNumber") as string)?.trim();
  const accountType = formData.get("accountType") as "savings" | "checking";
  const currency = formData.get("currency") as "DOP" | "USD";
  const accountHolder = (formData.get("accountHolder") as string)?.trim();
  const isActiveRaw = formData.get("isActive");
  const isActive = isActiveRaw === "true" || isActiveRaw === "on";

  if (!bankName || !accountHolder) {
    throw new Error("Bank name and account holder are required");
  }
  if (accountType !== "savings" && accountType !== "checking") {
    throw new Error("Account type must be savings or checking");
  }
  if (currency !== "DOP" && currency !== "USD") {
    throw new Error("Currency must be DOP or USD");
  }

  const updateData: {
    bankName: string;
    routingNumber?: string | null;
    accountType: "savings" | "checking";
    currency: "DOP" | "USD";
    accountHolder: string;
    isActive: boolean;
    accountNumber?: string;
    accountNumberIv?: string;
    accountNumberLast4?: string;
  } = {
    bankName,
    routingNumber,
    accountType,
    currency,
    accountHolder,
    isActive,
  };

  if (accountNumberRaw) {
    const { encrypted, iv } = encrypt(accountNumberRaw);
    updateData.accountNumber = encrypted;
    updateData.accountNumberIv = iv;
    updateData.accountNumberLast4 = getLast4(accountNumberRaw);
  }

  await prisma.bankAccount.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/dashboard/settings/bank-accounts");
  redirect("/dashboard/settings/bank-accounts");
}

/**
 * Returns the decrypted full account number for a bank account.
 * Requires users.manage permission. Use when user reveals banking info on the card.
 */
export async function getDecryptedAccountNumber(accountId: string): Promise<string> {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
    select: { accountNumber: true, accountNumberIv: true },
  });

  if (!account) throw new Error("Bank account not found");

  return decrypt(account.accountNumber, account.accountNumberIv);
}

/**
 * Deletes a bank account. Payments that referenced it will have receiving bank unset.
 */
export async function deleteBankAccount(formData: FormData) {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  if (!id) throw new Error("Bank account ID required");

  const account = await prisma.bankAccount.findUnique({ where: { id } });
  if (!account) throw new Error("Bank account not found");

  await prisma.payment.updateMany({
    where: { receivingBankAccountId: id },
    data: { receivingBankAccountId: null },
  });
  await prisma.bankAccount.delete({ where: { id } });

  revalidatePath("/dashboard/settings/bank-accounts");
  redirect("/dashboard/settings/bank-accounts");
}
