"use client";

/**
 * Client table for audit logs: clickable rows open AuditLogViewModal with full details
 * and parsed JSON metadata. Used by the audit page (server) with pre-fetched logs.
 */

import { useState, useCallback } from "react";
import { AuditLogViewModal, ActionBadge, type AuditLogRow } from "./AuditLogViewModal";

/** Server-sent log (createdAt may be Date before serialization). */
type ServerLog = Omit<AuditLogRow, "createdAt"> & { createdAt: string | Date };

type Props = {
  logs: ServerLog[];
};

/**
 * Renders desktop table and mobile cards; each row/card opens the view modal on click.
 */
export function AuditLogTable({ logs }: Props) {
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback((log: AuditLogRow) => {
    setSelectedLog(log);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedLog(null);
  }, []);

  /** Normalize server log for client (ensure createdAt is string). */
  const toRow = (log: ServerLog): AuditLogRow => ({
    ...log,
    createdAt: typeof log.createdAt === "string" ? log.createdAt : log.createdAt.toISOString(),
  });

  const rows = logs.map(toRow);

  return (
    <>
      {/* Desktop: premium table — navy header, subtle row hover (matches users/roles list) */}
      <div className="hidden md:block dashboard-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B] dark:bg-gray-700">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 dark:divide-gray-600 font-mono text-sm">
            {rows.map((log) => (
              <tr
                key={log.id}
                role="button"
                tabIndex={0}
                onClick={() => openModal(log)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal(log);
                  }
                }}
                className="hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] transition-colors duration-150 cursor-pointer"
              >
                <td className="px-6 py-3.5 text-[#0B132B]/80 dark:text-gray-300">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-3.5 font-sans font-semibold text-[#0B132B] dark:text-gray-100">
                  {log.user?.name || log.user?.email || "System"}
                </td>
                <td className="px-6 py-3.5">
                  <ActionBadge action={log.action} />
                </td>
                <td className="px-6 py-3.5 text-[#0B132B]/80 dark:text-gray-300">
                  {log.entityType}:{log.entityId.slice(0, 8)}...
                </td>
                <td className="px-6 py-3.5 text-[#8A8F98] dark:text-gray-400 truncate max-w-xs">
                  {log.metadata != null && typeof log.metadata === "object"
                    ? Object.keys(log.metadata as object).length > 0
                      ? `${Object.keys(log.metadata as object).length} field(s)`
                      : "—"
                    : log.metadata != null
                      ? String(log.metadata).slice(0, 50)
                      : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-[#8A8F98] dark:text-gray-400">
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: premium cards with left accent (matches users/roles list) */}
      <div className="md:hidden space-y-4">
        {rows.length === 0 ? (
          <div className="dashboard-card px-6 py-14 text-center text-[#8A8F98] dark:text-gray-400">
            No audit logs found
          </div>
        ) : (
          rows.map((log) => (
            <button
              key={log.id}
              type="button"
              onClick={() => openModal(log)}
              className="w-full text-left dashboard-card dashboard-card-accent p-5 hover:bg-[#1C6ED5]/[0.04] dark:hover:bg-white/[0.04] transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#8A8F98] dark:text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                  <p className="font-semibold text-[#0B132B] dark:text-gray-100 mt-1">
                    {log.user?.name || log.user?.email || "System"}
                  </p>
                </div>
                <ActionBadge action={log.action} />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 text-sm font-mono">
                <p className="text-[#0B132B]/80 dark:text-gray-300">
                  {log.entityType}:{log.entityId.slice(0, 8)}...
                </p>
                {log.metadata != null && typeof log.metadata === "object" && Object.keys(log.metadata as object).length > 0 ? (
                  <p className="text-[#8A8F98] dark:text-gray-400 mt-1 text-xs">
                    {Object.keys(log.metadata as object).length} field(s) — tap to view
                  </p>
                ) : log.metadata != null ? (
                  <p className="text-[#8A8F98] dark:text-gray-400 truncate mt-1 text-xs">
                    {String(log.metadata).slice(0, 60)}
                  </p>
                ) : null}
              </div>
            </button>
          ))
        )}
      </div>

      <AuditLogViewModal log={selectedLog} open={modalOpen} onClose={closeModal} />
    </>
  );
}
