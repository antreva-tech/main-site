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
    active: "text-green-600",
    paused: "text-yellow-600",
    cancelled: "text-red-600",
    expired: "text-gray-500",
  };
  return (
    <span className={`text-xs font-medium ${styles[status] ?? "text-gray-600"}`}>
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
          <div key={sub.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-medium text-gray-900">{sub.service.name}</p>
                <p className="text-sm text-gray-500">
                  {sub.billingCycle} · Started {formatDate(sub.startDate)}
                  {sub.endDate && ` · Ends ${formatDate(sub.endDate)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-right flex-wrap">
                <p className="font-semibold text-gray-900">
                  {sub.currency === "DOP" ? "RD$" : "$"}
                  {Number(sub.amount).toLocaleString()}
                </p>
                <StatusBadge status={sub.status} />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingSub(toModalSub(sub))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    Edit
                  </button>
                  <Link
                    href="/dashboard/payments"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
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
