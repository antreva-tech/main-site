/**
 * Server-side data helpers for payments pages.
 * Fetches active subscriptions and bank accounts for the payment-card form.
 */

import { prisma } from "@/lib/prisma";

/** Subscription option shape for the create-payment form. */
export interface SubscriptionOption {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  amount: number;
  currency: string;
}

/** Bank-account option shape for the create-payment form. */
export interface BankAccountOption {
  id: string;
  bankName: string;
  accountNumberLast4: string;
  accountHolder: string;
  currency: string;
}

/**
 * Fetches all active subscriptions with client + service info.
 * Used by the create-payment-card form.
 */
export async function getActiveSubscriptions(): Promise<SubscriptionOption[]> {
  const subs = await prisma.clientSubscription.findMany({
    where: { status: "active" },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      service: { select: { name: true } },
    },
    orderBy: { client: { name: "asc" } },
  });

  return subs.map((s) => ({
    id: s.id,
    clientId: s.client.id,
    clientName: s.client.name,
    clientPhone: s.client.phone,
    serviceName: s.service.name,
    amount: Number(s.amount),
    currency: s.currency,
  }));
}

/**
 * Fetches all active bank accounts for receiving payments.
 */
export async function getActiveBankAccounts(): Promise<BankAccountOption[]> {
  const accounts = await prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { bankName: "asc" },
    select: {
      id: true,
      bankName: true,
      accountNumberLast4: true,
      accountHolder: true,
      currency: true,
    },
  });

  return accounts.map((a) => ({
    id: a.id,
    bankName: a.bankName,
    accountNumberLast4: a.accountNumberLast4,
    accountHolder: a.accountHolder,
    currency: a.currency,
  }));
}
