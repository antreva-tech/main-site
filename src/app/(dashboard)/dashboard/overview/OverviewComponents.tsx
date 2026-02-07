/**
 * Reusable UI components for the dashboard overview.
 * StatCard, ListCard, skeletons, StageBadge, and formatters.
 */

import React, { Children } from "react";
import Link from "next/link";

/** Stat card color variant */
export type StatCardColor = "blue" | "green" | "yellow" | "purple";

const STAT_CARD_COLORS: Record<StatCardColor, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
  green: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800",
  purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800",
};

export interface StatCardProps {
  title: string;
  value: number;
  /** When set, shown as the main value instead of `value` (e.g. formatted currency). */
  valueFormatted?: string;
  label: string;
  detail: string;
  href: string;
  color: StatCardColor;
  alert?: boolean;
}

/**
 * KPI stat card: title, value (or valueFormatted), label, detail, link; optional alert dot.
 */
export function StatCard({
  title,
  value,
  valueFormatted,
  label,
  detail,
  href,
  color,
  alert,
}: StatCardProps) {
  const displayValue = valueFormatted ?? String(value);
  return (
    <Link
      href={href}
      className={`block p-6 rounded-xl border-2 ${STAT_CARD_COLORS[color]} hover:shadow-md dark:hover:shadow-lg dark:shadow-black/20 transition`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        {alert && (
          <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      <p className="text-3xl font-bold">{displayValue}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
      <p className="text-xs opacity-70 mt-1">{detail}</p>
    </Link>
  );
}

/**
 * Stat card skeleton for loading state.
 */
export function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 animate-pulse">
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-4" />
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-1" />
      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-600 rounded" />
    </div>
  );
}

export interface ListCardProps {
  title: string;
  href: string;
  emptyMessage: string;
  viewAllLabel?: string;
  /** Optional primary action (e.g. Create Lead) shown next to View All */
  primaryAction?: { label: string; href: string };
  /** When set, rendered instead of primaryAction Link (e.g. button that opens modal) */
  primaryActionNode?: React.ReactNode;
  /** Optional class for the list wrapper (e.g. space-y-2 for card-style rows instead of divide-y) */
  listContainerClassName?: string;
  children: React.ReactNode;
}

/**
 * List card: title, view-all link, optional primary action (link or custom node), list or empty message.
 */
export function ListCard({
  title,
  href,
  emptyMessage,
  viewAllLabel = "View all",
  primaryAction,
  primaryActionNode,
  listContainerClassName,
  children,
}: ListCardProps) {
  const hasItems = Children.count(children) > 0;
  const showPrimary = primaryActionNode ?? (primaryAction && (
    <Link
      href={primaryAction.href}
      className="text-sm font-medium text-[#1C6ED5] hover:underline dark:text-[#5ba3f5]"
    >
      {primaryAction.label}
    </Link>
  ));
  const listClass = listContainerClassName ?? "divide-y divide-gray-100 dark:divide-gray-600";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <div className="flex items-center gap-3">
          {showPrimary}
          <Link
            href={href}
            className="text-sm text-[#1C6ED5] hover:underline dark:text-[#5ba3f5]"
          >
            {viewAllLabel}
          </Link>
        </div>
      </div>
      {hasItems ? (
        <div className={listClass}>{children}</div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">{emptyMessage}</p>
      )}
    </div>
  );
}

/**
 * List skeleton for loading state.
 */
export function ListSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-1" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Stage badge colors; "new" uses Tech Blue for brand consistency. Dark mode variants appended. */
const STAGE_STYLES: Record<string, string> = {
  new: "bg-[#1C6ED5]/15 text-[#1C6ED5] dark:bg-[#1C6ED5]/30 dark:text-[#5ba3f5]",
  qualified: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200",
  proposal: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
  negotiation: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200",
  won: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
  lost: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

/**
 * Pipeline stage badge.
 */
export function StageBadge({
  stage,
  label,
}: {
  stage: string;
  label?: string;
}) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${STAGE_STYLES[stage] ?? STAGE_STYLES.new}`}
    >
      {label ?? stage}
    </span>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:border dark:border-gray-500",
  medium: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100 dark:border dark:border-slate-500",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 dark:border dark:border-amber-600/60",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 dark:border dark:border-red-600/60",
};

/**
 * Ticket priority badge.
 */
export function PriorityBadge({
  priority,
  label,
}: {
  priority: string;
  label?: string;
}) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium}`}
    >
      {label ?? priority}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300",
  in_progress: "bg-purple-100 text-purple-700 dark:bg-purple-400/20 dark:text-purple-300",
  waiting: "bg-yellow-100 text-yellow-700 dark:bg-amber-400/20 dark:text-amber-300",
  resolved: "bg-green-100 text-green-700 dark:bg-emerald-400/20 dark:text-emerald-300",
  closed: "bg-gray-100 text-gray-500 dark:bg-gray-500/25 dark:text-gray-400",
};

/**
 * Ticket status badge (open, in_progress, waiting, resolved, closed).
 */
export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const display = label ?? status.replace("_", " ");
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.open}`}>
      {display}
    </span>
  );
}

/**
 * Formats a number as currency (DOP → RD$, else $).
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === "DOP" ? "RD$" : "$";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/**
 * Short date for display (e.g. Jan 15).
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
