/**
 * Tickets List Page
 */

import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FilterLink } from "../components/FilterLink";
import { SortableTh, type TicketSortKey } from "../components/SortableTh";

const SORT_KEYS: TicketSortKey[] = ["subject", "client", "status", "priority", "assigned", "created"];

/** Build Prisma orderBy for tickets list; preserves include typing. */
function getOrderBy(
  sortBy: string | undefined,
  order: "asc" | "desc"
): Prisma.TicketOrderByWithRelationInput {
  const dir = order as "asc" | "desc";
  switch (sortBy) {
    case "subject":
      return { subject: dir };
    case "client":
      return { client: { name: dir } };
    case "status":
      return { status: dir };
    case "priority":
      return { priority: dir };
    case "assigned":
      return { assignedTo: { name: dir } };
    case "created":
    default:
      return { createdAt: dir };
  }
}

/**
 * Tickets page with filters and sortable columns.
 */
export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; clientId?: string; sortBy?: string; order?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;
  const clientIdFilter = params.clientId;
  const sortBy = (SORT_KEYS.includes(params.sortBy as TicketSortKey) ? params.sortBy : undefined) as TicketSortKey | undefined;
  const order = (params.order === "asc" || params.order === "desc" ? params.order : "desc") as "asc" | "desc";

  const ticketStatus = statusFilter as "open" | "in_progress" | "waiting" | "resolved" | "closed" | undefined;
  const tickets = await prisma.ticket.findMany({
    where: {
      ...(ticketStatus
        ? { status: ticketStatus }
        : { status: { not: "closed" } }),
      ...(clientIdFilter ? { clientId: clientIdFilter } : {}),
    },
    orderBy: getOrderBy(sortBy ?? "created", order),
    take: 50,
    include: {
      client: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Support Tickets</h1>
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
        <FilterLink
          href="/dashboard/tickets?status=closed"
          active={statusFilter === "closed"}
        >
          Closed
        </FilterLink>
      </div>

      {/* Desktop: premium table — navy header, sortable columns */}
      <div className="hidden md:block dashboard-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B] dark:bg-gray-700">
              <SortableTh
                basePath="/dashboard/tickets"
                searchParams={{ status: statusFilter, clientId: clientIdFilter, sortBy, order }}
                sortKey="subject"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["created"]}
              >
                Subject
              </SortableTh>
              <SortableTh
                basePath="/dashboard/tickets"
                searchParams={{ status: statusFilter, clientId: clientIdFilter, sortBy, order }}
                sortKey="client"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["created"]}
              >
                Client
              </SortableTh>
              <SortableTh
                basePath="/dashboard/tickets"
                searchParams={{ status: statusFilter, clientId: clientIdFilter, sortBy, order }}
                sortKey="status"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["created"]}
              >
                Status
              </SortableTh>
              <SortableTh
                basePath="/dashboard/tickets"
                searchParams={{ status: statusFilter, clientId: clientIdFilter, sortBy, order }}
                sortKey="priority"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["created"]}
              >
                Priority
              </SortableTh>
              <SortableTh
                basePath="/dashboard/tickets"
                searchParams={{ status: statusFilter, clientId: clientIdFilter, sortBy, order }}
                sortKey="assigned"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["created"]}
              >
                Assigned
              </SortableTh>
              <SortableTh
                basePath="/dashboard/tickets"
                searchParams={{ status: statusFilter, clientId: clientIdFilter, sortBy, order }}
                sortKey="created"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["created"]}
              >
                Created
              </SortableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 dark:divide-gray-600">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="font-medium text-gray-900 dark:text-gray-100 hover:text-[#1C6ED5]"
                  >
                    {ticket.subject}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <Link
                    href={`/dashboard/clients/${ticket.client.id}`}
                    className="hover:text-[#1C6ED5] block"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">{ticket.client.name}</span>
                    {ticket.client.company && (
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ticket.client.company}</span>
                    )}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {ticket.assignedTo?.name || "Unassigned"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {ticket.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
          <div className="dashboard-card px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            No tickets found
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              className="block dashboard-card p-4 hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{ticket.subject}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{ticket.client.name}</p>
                  {ticket.client.company && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{ticket.client.company}</p>
                  )}
                </div>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
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

/** Status badge. Labels and colors aligned with client detail TicketStatus. */
const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting: "Waiting",
  resolved: "Resolved",
  closed: "Closed",
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-[#1C6ED5]/15 text-[#1C6ED5] dark:bg-[#1C6ED5]/25 dark:text-[#7eb8ff]",
    in_progress: "bg-purple-500/15 text-purple-700 dark:bg-purple-500/30 dark:text-purple-200",
    waiting: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/30 dark:text-amber-200",
    resolved: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-200",
    closed: "bg-[#8A8F98]/20 text-[#6b7280] dark:bg-white/20 dark:text-gray-300",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${styles[status] ?? styles.open}`}>
      {TICKET_STATUS_LABELS[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}

/** Priority badge. Dark mode uses lighter shades for contrast. */
function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "text-gray-500 dark:text-gray-400",
    medium: "text-blue-600 dark:text-blue-400",
    high: "text-orange-600 dark:text-orange-400",
    urgent: "text-red-600 dark:text-red-400 font-semibold",
  };

  return <span className={`text-xs ${styles[priority] || styles.medium}`}>{priority}</span>;
}
