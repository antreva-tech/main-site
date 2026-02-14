/**
 * Server Actions for Payments
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logUpdate } from "@/lib/audit";
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
