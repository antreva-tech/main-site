/**
 * Payments List Page
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FilterLink } from "../components/FilterLink";

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Payments</h1>
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

      {/* Desktop: premium table — navy header, subtle row hover (matches clients list) */}
      <div className="hidden md:block dashboard-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B] dark:bg-gray-700">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 dark:divide-gray-600">
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/clients/${payment.schedule.subscription.client.id}`}
                    className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#1C6ED5]"
                  >
                    {payment.schedule.subscription.client.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {payment.schedule.subscription.service.name}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {payment.currency === "DOP" ? "RD$" : "$"}
                    {Number(payment.amount).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {payment.method.replace("_", " ")}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
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
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
          <div className="dashboard-card px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            No payments found
          </div>
        ) : (
          payments.map((payment) => (
            <Link
              key={payment.id}
              href={`/dashboard/payments/${payment.id}`}
              className="block dashboard-card p-4 hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {payment.schedule.subscription.client.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {payment.schedule.subscription.service.name}
                  </p>
                </div>
                <StatusBadge status={payment.status} />
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">
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
 * Status badge component. Dark mode uses lighter text for contrast.
 */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending_confirmation: "bg-yellow-100 text-yellow-700 dark:bg-amber-400/20 dark:text-amber-300",
    confirmed: "bg-green-100 text-green-700 dark:bg-emerald-400/20 dark:text-emerald-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-300",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending_confirmation}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
