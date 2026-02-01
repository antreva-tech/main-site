/**
 * Clients List Page
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FilterLink } from "../components/FilterLink";

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
      {/* Header: brand typography, refined CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B132B] tracking-tight">
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

      {/* Desktop: premium table — navy header, subtle row hover */}
      <div className="hidden md:block dashboard-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Started
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Subscriptions
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Tickets
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Project
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-[#1C6ED5]/[0.06] transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="group block"
                  >
                    <p className="font-semibold text-[#0B132B] group-hover:text-[#1C6ED5] transition-colors">
                      {client.name}
                    </p>
                    <p className="text-sm text-[#8A8F98] mt-0.5">
                      {client.company || client.email}
                    </p>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-6 py-4 text-sm text-[#0B132B]/80">
                  {client.startedAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-[#0B132B]/80">
                  {client._count.subscriptions}
                </td>
                <td className="px-6 py-4 text-sm text-[#0B132B]/80">
                  {client._count.tickets}
                </td>
                <td className="px-6 py-4 text-sm">
                  {client.developmentProject ? (
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getProjectStageStyles(client.developmentProject.stage)}`}
                    >
                      {formatDevStage(client.developmentProject.stage)}
                    </span>
                  ) : (
                    <span className="text-[#8A8F98]">—</span>
                  )}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-[#8A8F98]">
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
          <div className="dashboard-card px-6 py-14 text-center text-[#8A8F98]">
            No clients found
          </div>
        ) : (
          clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="block dashboard-card dashboard-card-accent p-5 active:scale-[0.99] transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0B132B] truncate">
                    {client.name}
                  </p>
                  <p className="text-sm text-[#8A8F98] truncate mt-0.5">
                    {client.company || client.email}
                  </p>
                </div>
                <StatusBadge status={client.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#0B132B]/70">
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
          ))
        )}
      </div>
    </div>
  );
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
 * Tailwind classes for project stage pill (color-coded).
 */
function getProjectStageStyles(stage: string): string {
  const styles: Record<string, string> = {
    discovery: "bg-blue-500/12 text-blue-700",
    design: "bg-violet-500/12 text-violet-700",
    development: "bg-[#1C6ED5]/12 text-[#1C6ED5]",
    qa: "bg-amber-500/12 text-amber-700",
    deployment: "bg-teal-500/12 text-teal-700",
    completed: "bg-emerald-500/12 text-emerald-700",
    on_hold: "bg-[#8A8F98]/20 text-[#8A8F98]",
  };
  return styles[stage] ?? "bg-[#0B132B]/10 text-[#0B132B]/80";
}

/**
 * Status badge component (client status: active, inactive, churned).
 */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/12 text-emerald-700",
    inactive: "bg-amber-500/12 text-amber-700",
    churned: "bg-red-500/12 text-red-700",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.active}`}
    >
      {status}
    </span>
  );
}
