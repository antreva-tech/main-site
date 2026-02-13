/**
 * Clients List Page
 */

import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FilterLink } from "../components/FilterLink";
import { SortableTh } from "../components/SortableTh";
import { ShowOnSiteCheckbox } from "./ShowOnSiteCheckbox";

const CLIENT_SORT_KEYS = ["name", "onSite", "status", "started", "subscriptions", "tickets", "project"] as const;
type ClientSortKey = (typeof CLIENT_SORT_KEYS)[number];

/** Build Prisma orderBy for clients list. */
function getClientOrderBy(
  sortBy: string | undefined,
  order: "asc" | "desc"
): Prisma.ClientOrderByWithRelationInput {
  const dir = order as "asc" | "desc";
  switch (sortBy) {
    case "name":
      return { name: dir };
    case "onSite":
      return { showOnWebsite: dir };
    case "status":
      return { status: dir };
    case "started":
      return { startedAt: dir };
    case "subscriptions":
      return { subscriptions: { _count: dir } };
    case "tickets":
      return { tickets: { _count: dir } };
    case "project":
      return { developmentProject: { stage: dir } };
    default:
      return { createdAt: dir };
  }
}

/**
 * Clients list page with filters and sortable columns.
 */
export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sortBy?: string; order?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status;
  const sortBy = (CLIENT_SORT_KEYS.includes(params.sortBy as ClientSortKey)
    ? params.sortBy
    : undefined) as ClientSortKey | undefined;
  const order = (params.order === "asc" || params.order === "desc" ? params.order : "desc") as "asc" | "desc";

  const clients = await prisma.client.findMany({
    where: statusFilter ? { status: statusFilter as "active" | "inactive" | "churned" } : undefined,
    orderBy: getClientOrderBy(sortBy ?? "started", order),
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      lineOfBusiness: true,
      status: true,
      showOnWebsite: true,
      startedAt: true,
      developmentProject: {
        select: { id: true, stage: true },
      },
      lead: {
        select: {
          whatsappEnabled: true,
          paymentHandling: true,
        },
      },
      _count: {
        select: { subscriptions: true, tickets: true },
      },
    },
  });

  return (
    <div>
      {/* Header: brand typography, refined CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B132B] dark:text-gray-100 tracking-tight">
          Clients
        </h1>
        <Link
          href="/dashboard/clients/new"
          className="w-full sm:w-auto px-5 py-2.5 bg-[#1C6ED5] text-white rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all duration-200 text-center"
        >
          + New Client
        </Link>
      </div>

      {/* Filters: pill style, brand active state */}
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

      {/* Desktop: premium table — navy header, sortable columns */}
      <div className="hidden md:block dashboard-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B] dark:bg-gray-700">
              <SortableTh
                basePath="/dashboard/clients"
                searchParams={{ status: statusFilter, sortBy, order }}
                sortKey="name"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["started"]}
              >
                Client
              </SortableTh>
              <SortableTh
                basePath="/dashboard/clients"
                searchParams={{ status: statusFilter, sortBy, order }}
                sortKey="onSite"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["started"]}
              >
                On site
              </SortableTh>
              <SortableTh
                basePath="/dashboard/clients"
                searchParams={{ status: statusFilter, sortBy, order }}
                sortKey="status"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["started"]}
              >
                Status
              </SortableTh>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">LoB</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Payment</th>
              <SortableTh
                basePath="/dashboard/clients"
                searchParams={{ status: statusFilter, sortBy, order }}
                sortKey="started"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["started"]}
              >
                Started
              </SortableTh>
              <SortableTh
                basePath="/dashboard/clients"
                searchParams={{ status: statusFilter, sortBy, order }}
                sortKey="subscriptions"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["started"]}
              >
                Subs
              </SortableTh>
              <SortableTh
                basePath="/dashboard/clients"
                searchParams={{ status: statusFilter, sortBy, order }}
                sortKey="tickets"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["started"]}
              >
                Tickets
              </SortableTh>
              <SortableTh
                basePath="/dashboard/clients"
                searchParams={{ status: statusFilter, sortBy, order }}
                sortKey="project"
                currentSortBy={sortBy}
                currentOrder={order}
                defaultDescKeys={["started"]}
              >
                Project
              </SortableTh>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 dark:divide-gray-600">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="group block"
                  >
                    <p className="font-semibold text-[#0B132B] dark:text-gray-100 group-hover:text-[#1C6ED5] transition-colors">
                      {client.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[#8A8F98] dark:text-gray-400 mt-0.5">
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          {client.phone}
                          {client.lead?.whatsappEnabled && (
                            <span className="text-[#25D366] text-[10px] font-bold" title="WhatsApp">WA</span>
                          )}
                        </span>
                      )}
                      {client.phone && client.email && <span>·</span>}
                      {client.email && <span className="truncate">{client.email}</span>}
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <ShowOnSiteCheckbox
                    clientId={client.id}
                    showOnWebsite={client.showOnWebsite}
                    label={`Show ${client.company || client.name} on main site`}
                  />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-4 py-4 text-xs text-[#0B132B]/80 dark:text-gray-300 capitalize">
                  {client.lineOfBusiness ? client.lineOfBusiness.replace(/_/g, " ") : "—"}
                </td>
                <td className="px-4 py-4 text-xs text-[#0B132B]/80 dark:text-gray-300">
                  {client.lead?.paymentHandling
                    ? formatPaymentHandling(client.lead.paymentHandling)
                    : "—"}
                </td>
                <td className="px-6 py-4 text-sm text-[#0B132B]/80 dark:text-gray-300">
                  {client.startedAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-[#0B132B]/80 dark:text-gray-300">
                  {client._count.subscriptions}
                </td>
                <td className="px-6 py-4 text-sm text-[#0B132B]/80 dark:text-gray-300">
                  {client._count.tickets}
                </td>
                <td className="px-6 py-4 text-sm">
                  {client.developmentProject ? (
                    <Link
                      href={`/dashboard/development/${client.developmentProject.id}`}
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition ${getProjectStageStyles(client.developmentProject.stage)}`}
                    >
                      {formatDevStage(client.developmentProject.stage)}
                    </Link>
                  ) : (
                    <span className="text-[#8A8F98] dark:text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center text-[#8A8F98] dark:text-gray-400">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: premium cards with left accent */}
      <div className="md:hidden space-y-4">
        {clients.length === 0 ? (
          <div className="dashboard-card px-6 py-14 text-center text-[#8A8F98] dark:text-gray-400">
            No clients found
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="dashboard-card dashboard-card-accent p-5"
            >
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="block active:scale-[0.99] transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0B132B] dark:text-gray-100 truncate">
                      {client.name}
                    </p>
                    <p className="text-sm text-[#8A8F98] dark:text-gray-400 truncate mt-0.5">
                      {client.company || client.email}
                    </p>
                  </div>
                  <StatusBadge status={client.status} />
                </div>
              </Link>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                <ShowOnSiteCheckbox
                  clientId={client.id}
                  showOnWebsite={client.showOnWebsite}
                  label={`Show ${client.company || client.name} on main site`}
                />
              </div>
              <Link href={`/dashboard/clients/${client.id}`} className="block">
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#0B132B]/70 dark:text-gray-300">
                  <span>Started {client.startedAt.toLocaleDateString()}</span>
                  <span>{client._count.subscriptions} subs</span>
                  <span>{client._count.tickets} tickets</span>
                  {client.developmentProject ? (
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getProjectStageStyles(client.developmentProject.stage)}`}
                    >
                      {formatDevStage(client.developmentProject.stage)}
                    </span>
                  ) : null}
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Human-readable payment handling label.
 */
function formatPaymentHandling(value: string): string {
  const labels: Record<string, string> = {
    CASH: "Cash",
    BANK_TRANSFER: "Bank",
    CARD: "Card",
    MIXED: "Mixed",
  };
  return labels[value] ?? value;
}

/**
 * Human-readable development stage label.
 */
function formatDevStage(stage: string): string {
  const labels: Record<string, string> = {
    discovery: "Discovery",
    design: "Design",
    development: "Development",
    qa: "QA",
    deployment: "Deployment",
    completed: "Completed",
    on_hold: "On Hold",
  };
  return labels[stage] ?? stage;
}

/**
 * Tailwind classes for project stage pill (color-coded). Dark mode uses lighter shades for contrast.
 */
function getProjectStageStyles(stage: string): string {
  const styles: Record<string, string> = {
    discovery: "bg-blue-500/12 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300",
    design: "bg-violet-500/12 text-violet-700 dark:bg-violet-400/20 dark:text-violet-300",
    development: "bg-[#1C6ED5]/12 text-[#1C6ED5] dark:bg-[#1C6ED5]/25 dark:text-blue-300",
    qa: "bg-amber-500/12 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300",
    deployment: "bg-teal-500/12 text-teal-700 dark:bg-teal-400/20 dark:text-teal-300",
    completed: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300",
    on_hold: "bg-[#8A8F98]/20 text-[#8A8F98] dark:bg-gray-500/25 dark:text-gray-400",
  };
  return styles[stage] ?? "bg-[#0B132B]/10 text-[#0B132B]/80 dark:bg-gray-500/20 dark:text-gray-300";
}

/**
 * Status badge component (client status: active, inactive, churned). Dark mode uses lighter text for contrast.
 */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300",
    inactive: "bg-amber-500/12 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300",
    churned: "bg-red-500/12 text-red-700 dark:bg-red-400/20 dark:text-red-300",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.active}`}
    >
      {status}
    </span>
  );
}
