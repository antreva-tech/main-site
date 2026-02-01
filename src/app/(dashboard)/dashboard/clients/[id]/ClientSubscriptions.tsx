"use client";

/**
 * Subscription list with Edit opening a modal; Remove lives inside the modal.
 */

import Link from "next/link";
import { useState } from "react";
import { SubscriptionEditModal, type SubscriptionForModal } from "./SubscriptionEditModal";

/** Subscription row (dates may be Date or ISO string after serialization). */
type SubscriptionRow = {
  id: string;
  serviceId: string;
  service: { id: string; name: string };
  amount: unknown;
  currency: string;
  billingCycle: string;
  startDate: Date | string;
  endDate: Date | string | null;
  status: string;
};

type ServiceOption = { id: string; name: string };

type Props = {
  subscriptions: SubscriptionRow[];
  clientId: string;
  services: ServiceOption[];
  updateSubscription: (formData: FormData) => Promise<void>;
  deleteSubscription: (formData: FormData) => Promise<void>;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/12 text-emerald-700",
    paused: "bg-amber-500/12 text-amber-700",
    cancelled: "bg-red-500/12 text-red-700",
    expired: "bg-[#8A8F98]/20 text-[#8A8F98]",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-[#0B132B]/10 text-[#0B132B]/80"}`}>
      {status}
    </span>
  );
}

function toModalSub(sub: SubscriptionRow): SubscriptionForModal {
  return {
    ...sub,
    startDate: sub.startDate instanceof Date ? sub.startDate.toISOString() : String(sub.startDate),
    endDate: sub.endDate
      ? sub.endDate instanceof Date
        ? (sub.endDate as Date).toISOString()
        : String(sub.endDate)
      : null,
  };
}

/** Format date in a fixed locale so server and client render the same (avoids hydration mismatch). */
function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" });
}

export function ClientSubscriptions({
  subscriptions,
  clientId,
  services,
  updateSubscription,
  deleteSubscription,
}: Props) {
  const [editingSub, setEditingSub] = useState<SubscriptionForModal | null>(null);

  return (
    <>
      <div className="space-y-3">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="p-4 rounded-xl border border-[#0B132B]/[0.08] bg-white/80 hover:bg-white hover:border-[#1C6ED5]/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-[#0B132B]">{sub.service.name}</p>
                <p className="text-sm text-[#8A8F98] mt-0.5">
                  {sub.billingCycle} · Started {formatDate(sub.startDate)}
                  {sub.endDate && ` · Ends ${formatDate(sub.endDate)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-right flex-wrap">
                <p className="font-semibold text-[#0B132B]">
                  {sub.currency === "DOP" ? "RD$" : "$"}
                  {Number(sub.amount).toLocaleString()}
                </p>
                <StatusBadge status={sub.status} />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSub(toModalSub(sub))}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-[#0B132B]/[0.12] bg-white text-[#0B132B] hover:bg-[#1C6ED5]/[0.06] hover:border-[#1C6ED5]/30 transition-all"
                  >
                    Edit
                  </button>
                  <Link
                    href="/dashboard/payments"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-[#0B132B]/[0.12] bg-white text-[#0B132B] hover:bg-[#1C6ED5]/[0.06] hover:border-[#1C6ED5]/30 transition-all"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubscriptionEditModal
        open={editingSub !== null}
        onClose={() => setEditingSub(null)}
        subscription={editingSub}
        clientId={clientId}
        services={services}
        updateSubscription={updateSubscription}
        deleteSubscription={deleteSubscription}
      />
    </>
  );
}
