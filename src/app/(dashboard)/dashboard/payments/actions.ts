/**
 * Server Actions for Payments
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, requirePermission } from "@/lib/auth";
import { logCreate, logUpdate } from "@/lib/audit";
import type { PaymentStatus } from "@/generated/prisma/client";

/**
 * Confirms a bank transfer payment.
 */
export async function confirmPayment(paymentId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { schedule: true },
  });
  if (!payment) throw new Error("Payment not found");

  // Update payment status
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "confirmed",
      confirmedById: session.id,
      confirmedAt: new Date(),
    },
  });

  // Update schedule status
  await prisma.paymentSchedule.update({
    where: { id: payment.scheduleId },
    data: {
      status: "paid",
      paidAt: new Date(),
    },
  });

  await logUpdate(session.id, "payment", paymentId,
    { status: payment.status },
    { status: "confirmed" }
  );

  revalidatePath("/dashboard/payments");
  revalidatePath(`/dashboard/payments/${paymentId}`);
  return updated;
}

/**
 * Rejects a bank transfer payment.
 */
export async function rejectPayment(paymentId: string, notes: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "rejected",
      notes,
      confirmedById: session.id,
      confirmedAt: new Date(),
    },
  });

  await logUpdate(session.id, "payment", paymentId,
    { status: payment.status },
    { status: "rejected", notes }
  );

  revalidatePath("/dashboard/payments");
  revalidatePath(`/dashboard/payments/${paymentId}`);
  return updated;
}

/**
 * Records a new payment for a schedule.
 */
export async function recordPayment(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const scheduleId = formData.get("scheduleId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = formData.get("currency") as "DOP" | "USD";
  const method = formData.get("method") as "bank_transfer" | "cash" | "card" | "other";
  
  // Bank transfer fields
  const receivingBankAccountId = formData.get("receivingBankAccountId") as string | null;
  const senderBankName = formData.get("senderBankName") as string | null;
  const senderAccountLast4 = formData.get("senderAccountLast4") as string | null;
  const transferReference = formData.get("transferReference") as string | null;
  const transferDateStr = formData.get("transferDate") as string | null;
  const proofUrl = formData.get("proofUrl") as string | null;
  const notes = formData.get("notes") as string | null;

  const payment = await prisma.payment.create({
    data: {
      scheduleId,
      amount,
      currency,
      method,
      status: method === "bank_transfer" ? "pending_confirmation" : "confirmed",
      receivingBankAccountId: receivingBankAccountId || null,
      senderBankName: senderBankName || null,
      senderAccountLast4: senderAccountLast4 || null,
      transferReference: transferReference || null,
      transferDate: transferDateStr ? new Date(transferDateStr) : null,
      proofUrl: proofUrl || null,
      notes: notes || null,
      confirmedById: method !== "bank_transfer" ? session.id : null,
      confirmedAt: method !== "bank_transfer" ? new Date() : null,
    },
  });

  // If not bank transfer, mark schedule as paid
  if (method !== "bank_transfer") {
    await prisma.paymentSchedule.update({
      where: { id: scheduleId },
      data: { status: "paid", paidAt: new Date() },
    });
  }

  revalidatePath("/dashboard/payments");
  return payment;
}

/** Return type for createPendingPaymentCard (used with useActionState). */
export type CreatePaymentCardState = { error?: string; paymentId?: string } | null;

/**
 * Creates a pending payment card for a client subscription or one-time charge.
 * - subscription charge: creates a PaymentSchedule + Payment.
 * - single charge: creates a SingleCharge + PaymentSchedule + Payment.
 * Requires `payments.write` permission.
 */
export async function createPendingPaymentCard(
  _prevState: CreatePaymentCardState,
  formData: FormData
): Promise<CreatePaymentCardState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  requirePermission(session, "payments.write");

  // --- Parse & validate common fields ---
  const chargeType = formData.get("chargeType") as string;
  if (chargeType !== "subscription" && chargeType !== "single") {
    return { error: "Charge type must be 'subscription' or 'single'" };
  }

  const subscriptionId = formData.get("subscriptionId") as string;
  if (!subscriptionId) return { error: "Subscription is required" };

  const bankAccountId = formData.get("bankAccountId") as string;
  if (!bankAccountId) return { error: "Bank account is required" };

  const amountRaw = formData.get("amount") as string;
  const amount = parseFloat(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) return { error: "A positive amount is required" };

  const currency = formData.get("currency") as "DOP" | "USD";
  if (currency !== "DOP" && currency !== "USD") return { error: "Currency must be DOP or USD" };

  // --- Validate subscription exists and is active ---
  const subscription = await prisma.clientSubscription.findUnique({
    where: { id: subscriptionId },
    include: { client: true, service: true },
  });
  if (!subscription || subscription.status !== "active") {
    return { error: "Active subscription not found" };
  }

  // --- Validate bank account ---
  const bankAccount = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } });
  if (!bankAccount || !bankAccount.isActive) return { error: "Bank account not found or inactive" };

  // --- Single charge fields ---
  let singleChargeId: string | null = null;
  let chargeLabel = subscription.service.name;

  if (chargeType === "single") {
    const label = (formData.get("chargeLabel") as string)?.trim();
    if (!label) return { error: "A label is required for single charges" };
    chargeLabel = label;

    const singleCharge = await prisma.singleCharge.create({
      data: {
        clientId: subscription.clientId,
        description: label,
        amount,
        currency,
        status: "pending",
      },
    });
    singleChargeId = singleCharge.id;
  }

  // --- Create PaymentSchedule ---
  const schedule = await prisma.paymentSchedule.create({
    data: {
      subscriptionId,
      dueDate: new Date(),
      amount,
      currency,
      status: "pending",
    },
  });

  // --- Create pending Payment ---
  const payment = await prisma.payment.create({
    data: {
      scheduleId: schedule.id,
      amount,
      currency,
      method: "bank_transfer",
      status: "pending_confirmation",
      receivingBankAccountId: bankAccountId,
      singleChargeId,
      notes: chargeType === "single" ? chargeLabel : null,
    },
  });

  await logCreate(session.id, "payment", payment.id, {
    chargeType,
    subscriptionId,
    bankAccountId,
    amount,
    currency,
    singleChargeId,
  });

  revalidatePath("/dashboard/payments");
  revalidatePath("/dashboard");
  return { paymentId: payment.id };
}
