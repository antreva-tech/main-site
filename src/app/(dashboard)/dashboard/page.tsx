/**
 * Dashboard Overview Page for Antreva CRM
 * Role-aware: shows only KPIs and list widgets the user has permission to see.
 * Uses locale cookie for translations; quick actions (e.g. Create Lead) when write permission exists.
 */

import React, { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getTranslations } from "@/i18n";
import type { Translations } from "@/i18n";
import {
  allowedKpis,
  allowedLists,
  canShowListAction,
} from "./overview/overviewConfig";
import {
  StatCard,
  StatCardSkeleton,
  ListCard,
  ListSkeleton,
  PriorityBadge,
  formatCurrency,
  formatDate,
} from "./overview/OverviewComponents";
import { RecentLeadsWithModal } from "./overview/RecentLeadsWithModal";
import type { LeadRow } from "./pipeline/PipelineBoard";

const LOCALE_COOKIE = "locale";

/**
 * Dashboard overview: session-driven widget visibility (RBAC) and optional quick actions.
 */
export default async function DashboardPage() {
  const session = await getSession();
  const permissions = session?.permissions ?? [];

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeCookie === "en" || localeCookie === "es" ? localeCookie : "es";
  const t = getTranslations(locale);

  const kpiKeys = allowedKpis(permissions);
  const listKeys = allowedLists(permissions);
  const listCols = Math.min(listKeys.length, 3) || 1;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        {t.dashboard.overview.title}
      </h1>

      {/* KPI cards: only those the user can read */}
      {kpiKeys.length > 0 && (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ${kpiKeys.length === 2 ? "lg:grid-cols-2" : ""} ${kpiKeys.length === 3 ? "lg:grid-cols-3" : ""} ${kpiKeys.length === 4 ? "lg:grid-cols-4" : ""}`}
        >
          {kpiKeys.includes("pipeline") && (
            <Suspense fallback={<StatCardSkeleton />}>
              <PipelineStats t={t} />
            </Suspense>
          )}
          {kpiKeys.includes("clients") && (
            <Suspense fallback={<StatCardSkeleton />}>
              <ClientStats t={t} />
            </Suspense>
          )}
          {kpiKeys.includes("payments") && (
            <Suspense fallback={<StatCardSkeleton />}>
              <PaymentStats t={t} />
            </Suspense>
          )}
          {kpiKeys.includes("tickets") && (
            <Suspense fallback={<StatCardSkeleton />}>
              <TicketStats t={t} />
            </Suspense>
          )}
        </div>
      )}

      {/* List widgets: only those the user can read; optional primary action (e.g. Create Lead) */}
      {listKeys.length > 0 && (
        <div
          className={`grid grid-cols-1 gap-6 ${listCols === 2 ? "lg:grid-cols-2" : ""} ${listCols === 3 ? "lg:grid-cols-3" : ""}`}
        >
          {listKeys.includes("recentLeads") && (
            <Suspense fallback={<ListSkeleton title={t.dashboard.overview.recentLeads} />}>
              <RecentLeads
                t={t}
                primaryAction={
                  canShowListAction("recentLeads", permissions)
                    ? { label: `+ ${t.dashboard.common.createLead}`, href: "/dashboard/pipeline" }
                    : undefined
                }
              />
            </Suspense>
          )}
          {listKeys.includes("pendingPayments") && (
            <Suspense fallback={<ListSkeleton title={t.dashboard.overview.pendingPayments} />}>
              <PendingPayments t={t} />
            </Suspense>
          )}
          {listKeys.includes("openTickets") && (
            <Suspense fallback={<ListSkeleton title={t.dashboard.overview.openTickets} />}>
              <OpenTickets t={t} />
            </Suspense>
          )}
        </div>
      )}

      {/* No widgets: minimal state (e.g. role with no read permissions) */}
      {kpiKeys.length === 0 && listKeys.length === 0 && (
        <p className="text-gray-500 text-sm py-8">
          {t.dashboard.overview.noModulesForRole}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// KPI WIDGETS (async, permission-filtered by parent)
// =============================================================================

async function PipelineStats({ t }: { t: Translations }) {
  const counts = await prisma.lead.groupBy({
    by: ["stage"],
    _count: { id: true },
  });
  const total = counts.reduce((sum, c) => sum + c._count.id, 0);
  const active = counts
    .filter((c) => !["won", "lost"].includes(c.stage))
    .reduce((sum, c) => sum + c._count.id, 0);

  return (
    <StatCard
      title={t.dashboard.overview.pipeline}
      value={active}
      label={t.dashboard.overview.activeLeads}
      detail={`${total} ${t.dashboard.overview.total}`}
      href="/dashboard/pipeline"
      color="blue"
    />
  );
}

async function ClientStats({ t }: { t: Translations }) {
  const [active, thisMonth] = await Promise.all([
    prisma.client.count({ where: { status: "active" } }),
    prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return (
    <StatCard
      title={t.dashboard.overview.clients}
      value={active}
      label={t.dashboard.overview.active}
      detail={`${thisMonth} ${t.dashboard.overview.newThisMonth}`}
      href="/dashboard/clients"
      color="green"
    />
  );
}

async function PaymentStats({ t }: { t: Translations }) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [overdue, dueThisWeek, pendingConfirmation] = await Promise.all([
    prisma.paymentSchedule.count({ where: { status: "overdue" } }),
    prisma.paymentSchedule.count({
      where: {
        status: "pending",
        dueDate: { gte: now, lte: weekFromNow },
      },
    }),
    prisma.payment.count({ where: { status: "pending_confirmation" } }),
  ]);

  return (
    <StatCard
      title={t.dashboard.overview.payments}
      value={pendingConfirmation}
      label={t.dashboard.overview.pendingConfirmation}
      detail={`${overdue} ${t.dashboard.overview.overdue}, ${dueThisWeek} ${t.dashboard.overview.dueThisWeek}`}
      href="/dashboard/payments"
      color="yellow"
      alert={overdue > 0}
    />
  );
}

async function TicketStats({ t }: { t: Translations }) {
  const counts = await prisma.ticket.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const open = counts
    .filter((c) => ["open", "in_progress", "waiting"].includes(c.status))
    .reduce((sum, c) => sum + c._count.id, 0);
  const urgent = await prisma.ticket.count({
    where: { priority: "urgent", status: { in: ["open", "in_progress"] } },
  });

  return (
    <StatCard
      title={t.dashboard.overview.tickets}
      value={open}
      label={t.dashboard.overview.open}
      detail={
        urgent > 0
          ? `${urgent} ${t.dashboard.overview.urgent}`
          : t.dashboard.overview.allUnderControl
      }
      href="/dashboard/tickets"
      color="purple"
      alert={urgent > 0}
    />
  );
}

// =============================================================================
// LIST WIDGETS (async, permission-filtered by parent)
// =============================================================================

/**
 * Maps DB lead to LeadRow (serialized for client; same shape as pipeline).
 */
function toLeadRow(
  l: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    stage: string;
    source: string;
    sourceOther: string | null;
    notes: string | null;
    lostReason: string | null;
    expectedValue: unknown;
    createdAt: Date;
    convertedClientId: string | null;
  }
): LeadRow {
  return {
    id: l.id,
    name: l.name,
    company: l.company,
    email: l.email,
    phone: l.phone,
    stage: l.stage as LeadRow["stage"],
    source: l.source,
    sourceOther: l.sourceOther,
    notes: l.notes,
    lostReason: l.lostReason,
    expectedValue: l.expectedValue != null ? Number(l.expectedValue) : null,
    createdAt: l.createdAt.toISOString(),
    convertedClientId: l.convertedClientId,
  };
}

async function RecentLeads({
  t,
  primaryAction,
}: {
  t: Translations;
  primaryAction?: { label: string; href: string };
}) {
  const leads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      stage: true,
      source: true,
      sourceOther: true,
      notes: true,
      lostReason: true,
      expectedValue: true,
      createdAt: true,
      convertedClientId: true,
    },
  });

  const rows: LeadRow[] = leads.map(toLeadRow);
  const stageLabels = t.dashboard.pipeline.stages as Record<string, string>;

  return (
    <RecentLeadsWithModal
      leads={rows}
      title={t.dashboard.overview.recentLeads}
      href="/dashboard/pipeline"
      emptyMessage={t.dashboard.overview.noLeadsYet}
      viewAllLabel={t.dashboard.common.viewAll}
      primaryAction={primaryAction}
      stageLabels={stageLabels}
    />
  );
}

async function PendingPayments({ t }: { t: Translations }) {
  const payments = await prisma.payment.findMany({
    where: { status: "pending_confirmation" },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      schedule: {
        include: {
          subscription: {
            include: { client: { select: { name: true } } },
          },
        },
      },
    },
  });

  return (
    <ListCard
      title={t.dashboard.overview.pendingPayments}
      href="/dashboard/payments?status=pending_confirmation"
      emptyMessage={t.dashboard.overview.noPendingConfirmations}
      viewAllLabel={t.dashboard.common.viewAll}
    >
      {payments.map((payment) => (
        <Link
          key={payment.id}
          href={`/dashboard/payments/${payment.id}`}
          className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-4 px-4 transition"
        >
          <div>
            <p className="font-medium text-gray-900">
              {payment.schedule.subscription.client.name}
            </p>
            <p className="text-sm text-gray-500">
              {payment.transferReference || "No reference"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatCurrency(Number(payment.amount), payment.currency)}
            </p>
            <p className="text-xs text-gray-500">{formatDate(payment.paidAt)}</p>
          </div>
        </Link>
      ))}
    </ListCard>
  );
}

async function OpenTickets({ t }: { t: Translations }) {
  const tickets = await prisma.ticket.findMany({
    where: { status: { in: ["open", "in_progress", "waiting"] } },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      subject: true,
      priority: true,
      client: { select: { name: true } },
    },
  });

  return (
    <ListCard
      title={t.dashboard.overview.openTickets}
      href="/dashboard/tickets"
      emptyMessage={t.dashboard.overview.noOpenTickets}
      viewAllLabel={t.dashboard.common.viewAll}
    >
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/dashboard/tickets/${ticket.id}`}
          className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-4 px-4 transition"
        >
          <div>
            <p className="font-medium text-gray-900">{ticket.subject}</p>
            <p className="text-sm text-gray-500">{ticket.client.name}</p>
          </div>
          <PriorityBadge priority={ticket.priority} />
        </Link>
      ))}
    </ListCard>
  );
}
