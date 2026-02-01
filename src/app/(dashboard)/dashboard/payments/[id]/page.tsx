/**
 * Payment Detail Page
 * Shows payment info and allows confirmation/rejection of bank transfers.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PaymentActions } from "./PaymentActions";

/**
 * Payment detail page.
 */
export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      schedule: {
        include: {
          subscription: {
            include: {
              client: { select: { id: true, name: true, email: true } },
              service: { select: { name: true } },
            },
          },
        },
      },
      receivingBankAccount: { select: { bankName: true, accountNumberLast4: true } },
      confirmedBy: { select: { name: true } },
    },
  });

  if (!payment) {
    notFound();
  }

  const client = payment.schedule.subscription.client;

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/dashboard/payments"
          className="text-[#1C6ED5] hover:underline text-sm"
        >
          ← Back to Payments
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {payment.currency === "DOP" ? "RD$" : "$"}
              {Number(payment.amount).toLocaleString()}
            </h1>
            <p className="text-gray-600 mt-1">
              {payment.schedule.subscription.service.name}
            </p>
          </div>
          <StatusBadge status={payment.status} />
        </div>

        {/* Client Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase mb-1">Client</p>
          <Link
            href={`/dashboard/clients/${client.id}`}
            className="font-medium text-[#1C6ED5] hover:underline"
          >
            {client.name}
          </Link>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>

        {/* Payment Details */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Method</p>
            <p className="font-medium capitalize">
              {payment.method.replace("_", " ")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Payment Date</p>
            <p className="font-medium">{payment.paidAt.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Bank Transfer Details */}
        {payment.method === "bank_transfer" && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Bank Transfer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {payment.receivingBankAccount && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Receiving Account</p>
                  <p className="font-medium">
                    {payment.receivingBankAccount.bankName} (****
                    {payment.receivingBankAccount.accountNumberLast4})
                  </p>
                </div>
              )}
              {payment.senderBankName && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Sender Bank</p>
                  <p className="font-medium">{payment.senderBankName}</p>
                </div>
              )}
              {payment.senderAccountLast4 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Sender Account</p>
                  <p className="font-medium">****{payment.senderAccountLast4}</p>
                </div>
              )}
              {payment.transferReference && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Reference</p>
                  <p className="font-medium font-mono">{payment.transferReference}</p>
                </div>
              )}
              {payment.transferDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Transfer Date</p>
                  <p className="font-medium">
                    {payment.transferDate.toLocaleDateString()}
                  </p>
                </div>
              )}
              {payment.proofUrl && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase">Proof</p>
                  <a
                    href={payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1C6ED5] hover:underline"
                  >
                    View Receipt →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Info */}
        {payment.confirmedBy && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {payment.status === "confirmed" ? "Confirmed" : "Rejected"} by{" "}
                <strong>{payment.confirmedBy.name}</strong>
              </span>
              {payment.confirmedAt && (
                <span>on {payment.confirmedAt.toLocaleString()}</span>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase mb-2">Notes</p>
            <p className="text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {payment.status === "pending_confirmation" && (
        <PaymentActions paymentId={payment.id} />
      )}

      {/* Metadata */}
      <div className="mt-6 text-xs text-gray-400">
        <p>Created: {payment.createdAt.toLocaleString()}</p>
        <p>ID: {payment.id}</p>
      </div>
    </div>
  );
}

/**
 * Status badge component.
 */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_confirmation: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pending_confirmation}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
