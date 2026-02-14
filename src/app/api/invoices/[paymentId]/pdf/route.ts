/**
 * GET /api/invoices/[paymentId]/pdf
 * Returns a branded Antreva Tech PDF invoice for the given payment.
 * Requires an authenticated session with payments.read permission.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hasPermission } from "@/lib/auth";
import { generateInvoicePdf, type InvoiceData } from "@/lib/invoice-pdf";

/**
 * Handles the GET request to generate and return a PDF invoice.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  // ── Auth check ──────────────────────────────────────────────
  const session = await getSession();
  if (!session || !hasPermission(session, "payments.read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Fetch payment with all relations ────────────────────────
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      schedule: {
        include: {
          subscription: {
            include: {
              client: {
                select: { name: true, email: true, company: true },
              },
              service: { select: { name: true } },
            },
          },
        },
      },
      singleCharge: { select: { description: true } },
      receivingBankAccount: {
        select: {
          bankName: true,
          accountHolder: true,
          accountNumberLast4: true,
          accountType: true,
          currency: true,
        },
      },
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // ── Resolve optional company phone (first active WhatsApp phone) ──
  const waPhone = await prisma.whatsAppPhone.findFirst({
    where: { isActive: true },
    select: { displayPhoneNumber: true },
  });

  // ── Build invoice data ──────────────────────────────────────
  const client = payment.schedule.subscription.client;
  const serviceName = payment.schedule.subscription.service.name;
  const itemDescription = payment.singleCharge?.description ?? serviceName;

  const invoiceData: InvoiceData = {
    paymentId: payment.id,
    invoiceDate: payment.createdAt,
    generatorName: session.name,
    companyPhone: waPhone?.displayPhoneNumber ?? null,
    clientName: client.name,
    clientCompany: client.company,
    clientEmail: client.email,
    items: [
      {
        description: itemDescription,
        amount: Number(payment.amount),
        currency: payment.currency,
      },
    ],
    total: Number(payment.amount),
    currency: payment.currency,
    bankInfo: payment.receivingBankAccount
      ? {
          bankName: payment.receivingBankAccount.bankName,
          accountHolder: payment.receivingBankAccount.accountHolder,
          accountNumberLast4: payment.receivingBankAccount.accountNumberLast4,
          accountType: payment.receivingBankAccount.accountType,
          currency: payment.receivingBankAccount.currency,
        }
      : null,
  };

  // ── Generate PDF ────────────────────────────────────────────
  const pdfBytes = await generateInvoicePdf(invoiceData);
  const buffer = Buffer.from(pdfBytes);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${paymentId.slice(-8)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
