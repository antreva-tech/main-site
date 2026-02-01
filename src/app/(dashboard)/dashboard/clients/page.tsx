/**
 * Clients List Page
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * Clients list page with filters.
 */
export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;

  const clients = await prisma.client.findMany({
    where: statusFilter ? { status: statusFilter as "active" | "inactive" | "churned" } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      status: true,
      startedAt: true,
      developmentProject: {
        select: { stage: true },
      },
      _count: {
        select: { subscriptions: true, tickets: true },
      },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
        <Link
          href="/dashboard/clients/new"
          className="w-full sm:w-auto px-4 py-2.5 bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition text-center"
        >
          + New Client
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterLink href="/dashboard/clients" active={!statusFilter}>
          All
        </FilterLink>
        <FilterLink
          href="/dashboard/clients?status=active"
          active={statusFilter === "active"}
        >
          Active
        </FilterLink>
        <FilterLink
          href="/dashboard/clients?status=inactive"
          active={statusFilter === "inactive"}
        >
          Inactive
        </FilterLink>
        <FilterLink
          href="/dashboard/clients?status=churned"
          active={statusFilter === "churned"}
        >
          Churned
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Started
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Subscriptions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tickets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Project
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="hover:text-[#1C6ED5]"
                  >
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">
                      {client.company || client.email}
                    </p>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client.startedAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client._count.subscriptions}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client._count.tickets}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {client.developmentProject ? (
                    <span className="capitalize">
                      {client.developmentProject.stage.replace("_", " ")}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-500">
            No clients found
          </div>
        ) : (
          clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{client.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {client.company || client.email}
                  </p>
                </div>
                <StatusBadge status={client.status} />
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                <span>Started {client.startedAt.toLocaleDateString()}</span>
                <span>{client._count.subscriptions} subs</span>
                <span>{client._count.tickets} tickets</span>
                {client.developmentProject ? (
                  <span>Project: {client.developmentProject.stage.replace("_", " ")}</span>
                ) : null}
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
    active: "bg-green-100 text-green-700",
    inactive: "bg-yellow-100 text-yellow-700",
    churned: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}
    >
      {status}
    </span>
  );
}
