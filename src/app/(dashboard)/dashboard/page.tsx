/**
 * Dashboard Overview Page for Antreva CRM
 * Displays key metrics and recent activity. Uses locale cookie for translations.
 */

import React, { Suspense, Children } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "@/i18n";
import type { Translations } from "@/i18n";

const LOCALE_COOKIE = "locale";

/**
 * Dashboard overview page with parallel-loaded widgets.
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeCookie === "en" || localeCookie === "es" ? localeCookie : "es";
  const t = getTranslations(locale);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        {t.dashboard.overview.title}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Suspense fallback={<StatCardSkeleton />}>
          <PipelineStats t={t} />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <ClientStats t={t} />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <PaymentStats t={t} />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <TicketStats t={t} />
        </Suspense>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ListSkeleton title={t.dashboard.overview.recentLeads} />}>
          <RecentLeads t={t} />
        </Suspense>
        <Suspense fallback={<ListSkeleton title={t.dashboard.overview.pendingPayments} />}>
          <PendingPayments t={t} />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Pipeline statistics widget.
 */
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

/**
 * Client statistics widget.
 */
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

/**
 * Payment statistics widget.
 */
async function PaymentStats({ t }: { t: Translations }) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [overdue, dueThisWeek, pendingConfirmation] = await Promise.all([
    prisma.paymentSchedule.count({
      where: { status: "overdue" },
    }),
    prisma.paymentSchedule.count({
      where: {
        status: "pending",
        dueDate: { gte: now, lte: weekFromNow },
      },
    }),
    prisma.payment.count({
      where: { status: "pending_confirmation" },
    }),
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

/**
 * Ticket statistics widget.
 */
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
      detail={urgent > 0 ? `${urgent} ${t.dashboard.overview.urgent}` : t.dashboard.overview.allUnderControl}
      href="/dashboard/tickets"
      color="purple"
      alert={urgent > 0}
    />
  );
}

/**
 * Recent leads list widget.
 */
async function RecentLeads({ t }: { t: Translations }) {
  const leads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      stage: true,
      createdAt: true,
    },
  });

  return (
    <ListCard
      title={t.dashboard.overview.recentLeads}
      href="/dashboard/pipeline"
      emptyMessage={t.dashboard.overview.noLeadsYet}
      viewAllLabel={t.dashboard.common.viewAll}
    >
      {leads.map((lead) => (
        <Link
          key={lead.id}
          href={`/dashboard/pipeline/${lead.id}`}
          className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-4 px-4 transition"
        >
          <div>
            <p className="font-medium text-gray-900">{lead.name}</p>
            <p className="text-sm text-gray-500">{lead.company || "—"}</p>
          </div>
          <StageBadge stage={lead.stage} label={t.dashboard.pipeline.stages[lead.stage as keyof typeof t.dashboard.pipeline.stages]} />
        </Link>
      ))}
    </ListCard>
  );
}

/**
 * Pending payments list widget.
 */
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
            <p className="text-xs text-gray-500">
              {formatDate(payment.paidAt)}
            </p>
          </div>
        </Link>
      ))}
    </ListCard>
  );
}

// =============================================================================
// UI COMPONENTS
// =============================================================================

/**
 * Stat card component.
 */
function StatCard({
  title,
  value,
  label,
  detail,
  href,
  color,
  alert,
}: {
  title: string;
  value: number;
  label: string;
  detail: string;
  href: string;
  color: "blue" | "green" | "yellow" | "purple";
  alert?: boolean;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <Link
      href={href}
      className={`block p-6 rounded-xl border-2 ${colors[color]} hover:shadow-md transition`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        {alert && (
          <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
      <p className="text-xs opacity-70 mt-1">{detail}</p>
    </Link>
  );
}

/**
 * Stat card skeleton for loading state.
 */
function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border-2 border-gray-200 animate-pulse">
      <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
    </div>
  );
}

/**
 * List card component.
 */
function ListCard({
  title,
  href,
  emptyMessage,
  viewAllLabel = "View all",
  children,
}: {
  title: string;
  href: string;
  emptyMessage: string;
  viewAllLabel?: string;
  children: React.ReactNode;
}) {
  const hasItems = Children.count(children) > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Link
          href={href}
          className="text-sm text-[#1C6ED5] hover:underline"
        >
          {viewAllLabel}
        </Link>
      </div>
      {hasItems ? (
        <div className="divide-y divide-gray-100">{children}</div>
      ) : (
        <p className="text-gray-500 text-sm py-4 text-center">{emptyMessage}</p>
      )}
    </div>
  );
}

/**
 * List skeleton for loading state.
 */
function ListSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Stage badge component.
 */
function StageBadge({ stage, label }: { stage: string; label?: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    qualified: "bg-cyan-100 text-cyan-700",
    proposal: "bg-purple-100 text-purple-700",
    negotiation: "bg-yellow-100 text-yellow-700",
    won: "bg-green-100 text-green-700",
    lost: "bg-gray-100 text-gray-500",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[stage] || styles.new}`}>
      {label ?? stage}
    </span>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Formats a number as currency.
 */
function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === "DOP" ? "RD$" : "$";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/**
 * Formats a date for display.
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
