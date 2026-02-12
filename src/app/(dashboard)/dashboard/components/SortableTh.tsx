"use client";

/**
 * Sortable table header cell: links to same page with sort params, preserves existing filters.
 * Toggling: same column flips asc/desc; new column uses asc unless in defaultDescKeys (e.g. date columns).
 */

import Link from "next/link";

/** Tickets list sort keys (exported for page type safety). */
export type TicketSortKey = "subject" | "client" | "status" | "priority" | "assigned" | "created";

export interface SortableThProps {
  /** Base path (e.g. /dashboard/tickets) */
  basePath: string;
  /** Current query params to preserve (status, clientId, etc.) */
  searchParams: Record<string, string | undefined>;
  /** This column's sort key */
  sortKey: string;
  /** Current active sort column */
  currentSortBy: string | undefined;
  /** Current order */
  currentOrder: "asc" | "desc";
  /** Keys that default to desc when first selected (e.g. ["created", "date", "started"]) */
  defaultDescKeys?: string[];
  /** Label shown in header */
  children: React.ReactNode;
}

/**
 * Builds href with sort params. Same column toggles order; new column uses defaultDescKeys for initial direction.
 */
export function SortableTh({
  basePath,
  searchParams,
  sortKey,
  currentSortBy,
  currentOrder,
  defaultDescKeys = [],
  children,
}: SortableThProps) {
  const isActive = currentSortBy === sortKey;
  const defaultDesc = defaultDescKeys.includes(sortKey);
  const order: "asc" | "desc" =
    isActive ? (currentOrder === "asc" ? "desc" : "asc") : defaultDesc ? "desc" : "asc";

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v != null && v !== "") params.set(k, v);
  });
  params.set("sortBy", sortKey);
  params.set("order", order);
  const href = `${basePath}?${params.toString()}`;

  return (
    <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
      <Link
        href={href}
        className="inline-flex items-center gap-1 hover:text-white dark:hover:text-gray-100 transition-colors"
      >
        {children}
        {isActive && (
          <span className="text-white/70 dark:text-gray-300" aria-hidden>
            {currentOrder === "asc" ? "↑" : "↓"}
          </span>
        )}
      </Link>
    </th>
  );
}
