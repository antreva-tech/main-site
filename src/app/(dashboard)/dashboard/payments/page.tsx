/**
 * Payments List Page
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * Payments page with filters.
 */
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;

  const payments = await prisma.payment.findMany({
    where: statusFilter
      ? { status: statusFilter as "pending_confirmation" | "confirmed" | "rejected" }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      schedule: {
        include: {
          subscription: {
            include: {
              client: { select: { id: true, name: true } },
              service: { select: { name: true } },
            },
          },
        },
      },
      confirmedBy: { select: { name: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payments</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterLink href="/dashboard/payments" active={!statusFilter}>
          All
        </FilterLink>
        <FilterLink
          href="/dashboard/payments?status=pending_confirmation"
          active={statusFilter === "pending_confirmation"}
        >
          Pending Confirmation
        </FilterLink>
        <FilterLink
          href="/dashboard/payments?status=confirmed"
          active={statusFilter === "confirmed"}
        >
          Confirmed
        </FilterLink>
        <FilterLink
          href="/dashboard/payments?status=rejected"
          active={statusFilter === "rejected"}
        >
          Rejected
        </FilterLink>
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/clients/${payment.schedule.subscription.client.id}`}
                    className="font-medium text-gray-900 hover:text-[#1C6ED5]"
                  >
                    {payment.schedule.subscription.client.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {payment.schedule.subscription.service.name}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium">
                    {payment.currency === "DOP" ? "RD$" : "$"}
                    {Number(payment.amount).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                  {payment.method.replace("_", " ")}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <Link
                    href={`/dashboard/payments/${payment.id}`}
                    className="hover:text-[#1C6ED5]"
                  >
                    {payment.paidAt.toLocaleDateString()}
                  </Link>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {payments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-500">
            No payments found
          </div>
        ) : (
          payments.map((payment) => (
            <Link
              key={payment.id}
              href={`/dashboard/payments/${payment.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    {payment.schedule.subscription.client.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {payment.schedule.subscription.service.name}
                  </p>
                </div>
                <StatusBadge status={payment.status} />
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">
                  {payment.currency === "DOP" ? "RD$" : "$"}
                  {Number(payment.amount).toLocaleString()}
                </span>
                <span className="capitalize">{payment.method.replace("_", " ")}</span>
                <span>{payment.paidAt.toLocaleDateString()}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Filter link component.
 */
function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-lg font-medium transition ${
        active
          ? "bg-[#1C6ED5] text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </Link>
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
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending_confirmation}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
