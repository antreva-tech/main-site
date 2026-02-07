"use client";

/**
 * Single (one-time) charges list with Edit opening a modal; Remove lives in the modal footer.
 */

import { useState } from "react";
import { SingleChargeEditModal, type SingleChargeForModal } from "./SingleChargeEditModal";

/** Single charge row (chargedAt may be Date or ISO string after serialization). */
type SingleChargeRow = {
  id: string;
  description: string;
  amount: unknown;
  currency: string;
  chargedAt: Date | string;
  status: string;
  notes: string | null;
};

type Props = {
  charges: SingleChargeRow[];
  clientId: string;
  updateSingleCharge: (formData: FormData) => Promise<void>;
  deleteSingleCharge: (formData: FormData) => Promise<void>;
};

/** Status pill with dark mode variants. */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/12 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300",
    paid: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300",
    cancelled: "bg-red-500/12 text-red-700 dark:bg-red-500/25 dark:text-red-300",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-[#0B132B]/10 text-[#0B132B]/80 dark:bg-white/10 dark:text-gray-300"}`}>
      {status}
    </span>
  );
}

function toModalCharge(row: SingleChargeRow): SingleChargeForModal {
  const chargedAt = row.chargedAt instanceof Date ? row.chargedAt.toISOString() : String(row.chargedAt);
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
    chargedAt: chargedAt.slice(0, 10),
    status: row.status,
    notes: row.notes,
  };
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" });
}

export function ClientSingleCharges({
  charges,
  clientId,
  updateSingleCharge,
  deleteSingleCharge,
}: Props) {
  const [editingCharge, setEditingCharge] = useState<SingleChargeForModal | null>(null);

  return (
    <>
      <div className="space-y-3">
        {charges.map((charge) => (
          <div
            key={charge.id}
            className="p-4 rounded-xl border border-[#0B132B]/[0.08] dark:border-white/10 bg-white/80 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] hover:border-[#1C6ED5]/20 dark:hover:border-[#1C6ED5]/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-[#0B132B] dark:text-gray-100">{charge.description}</p>
                <p className="text-sm text-[#8A8F98] dark:text-gray-400 mt-0.5">
                  {formatDate(charge.chargedAt)}
                  {charge.notes && ` · ${charge.notes}`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-right flex-wrap">
                <p className="font-semibold text-[#0B132B] dark:text-gray-100">
                  {charge.currency === "DOP" ? "RD$" : "$"}
                  {Number(charge.amount).toLocaleString()}
                </p>
                <StatusBadge status={charge.status} />
                <button
                  type="button"
                  onClick={() => setEditingCharge(toModalCharge(charge))}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-[#0B132B]/[0.12] dark:border-white/20 bg-white dark:bg-white/10 text-[#0B132B] dark:text-gray-100 hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-[#1C6ED5]/20 hover:border-[#1C6ED5]/30 transition-all"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SingleChargeEditModal
        open={editingCharge !== null}
        onClose={() => setEditingCharge(null)}
        charge={editingCharge}
        clientId={clientId}
        updateSingleCharge={updateSingleCharge}
        deleteSingleCharge={deleteSingleCharge}
      />
    </>
  );
}
