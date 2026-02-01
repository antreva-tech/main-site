/**
 * Tickets List Page
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FilterLink } from "../components/FilterLink";

/**
 * Tickets page with filters.
 */
export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; clientId?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;
  const clientIdFilter = params.clientId;

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as "open" | "in_progress" | "waiting" | "resolved" | "closed" } : {}),
      ...(clientIdFilter ? { clientId: clientIdFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      client: { select: { id: true, name: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Tickets</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterLink href="/dashboard/tickets" active={!statusFilter}>
          All
        </FilterLink>
        <FilterLink
          href="/dashboard/tickets?status=open"
          active={statusFilter === "open"}
        >
          Open
        </FilterLink>
        <FilterLink
          href="/dashboard/tickets?status=in_progress"
          active={statusFilter === "in_progress"}
        >
          In Progress
        </FilterLink>
        <FilterLink
          href="/dashboard/tickets?status=waiting"
          active={statusFilter === "waiting"}
        >
          Waiting
        </FilterLink>
        <FilterLink
          href="/dashboard/tickets?status=resolved"
          active={statusFilter === "resolved"}
        >
          Resolved
        </FilterLink>
      </div>

      {/* Desktop: premium table — navy header, subtle row hover (matches clients list) */}
      <div className="hidden md:block dashboard-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-[#1C6ED5]/[0.06] transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="font-medium text-gray-900 hover:text-[#1C6ED5]"
                  >
                    {ticket.subject}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <Link
                    href={`/dashboard/clients/${ticket.client.id}`}
                    className="hover:text-[#1C6ED5]"
                  >
                    {ticket.client.name}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {ticket.assignedTo?.name || "Unassigned"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {ticket.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No tickets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-500">
            No tickets found
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                  <p className="text-sm text-gray-500 truncate">{ticket.client.name}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                <PriorityBadge priority={ticket.priority} />
                <span>{ticket.assignedTo?.name || "Unassigned"}</span>
                <span>{ticket.createdAt.toLocaleDateString()}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-purple-100 text-purple-700",
    waiting: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-500",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.open}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "text-gray-500",
    medium: "text-blue-600",
    high: "text-orange-600",
    urgent: "text-red-600 font-semibold",
  };

  return <span className={`text-xs ${styles[priority] || styles.medium}`}>{priority}</span>;
}
