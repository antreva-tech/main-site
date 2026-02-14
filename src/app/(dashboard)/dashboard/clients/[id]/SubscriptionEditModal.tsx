"use client";

/**
 * Modal for editing or deleting a client subscription.
 * Uses shared EditModal; Remove is in the modal footer.
 */

import { EditModal } from "../../components/EditModal";

/** Shared input/select styles for light and dark mode (brand focus ring). */
const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]";

export type SubscriptionForModal = {
  id: string;
  serviceId: string;
  service: { id: string; name: string };
  amount: unknown;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
  /** Day of month (1–31) for payment due date; null if not set. */
  paymentDayOfMonth: number | null;
  status: string;
};

type ServiceOption = { id: string; name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  subscription: SubscriptionForModal | null;
  clientId: string;
  services: ServiceOption[];
  updateSubscription: (formData: FormData) => Promise<void>;
  deleteSubscription: (formData: FormData) => Promise<void>;
};

function statusStyle(status: string): string {
  const map: Record<string, string> = {
    active: "text-green-600 dark:text-green-400",
    paused: "text-yellow-600 dark:text-yellow-400",
    cancelled: "text-red-600 dark:text-red-400",
    expired: "text-gray-500 dark:text-gray-400",
  };
  return map[status] ?? "text-gray-600 dark:text-gray-400";
}

export function SubscriptionEditModal({
  open,
  onClose,
  subscription,
  clientId,
  services,
  updateSubscription,
  deleteSubscription,
}: Props) {
  if (!open || !subscription) return null;

  const startDateStr =
    typeof subscription.startDate === "string"
      ? subscription.startDate.slice(0, 10)
      : (subscription.startDate as Date).toISOString?.().slice(0, 10) ?? "";
  const endDateStr = subscription.endDate
    ? typeof subscription.endDate === "string"
      ? subscription.endDate.slice(0, 10)
      : (subscription.endDate as Date).toISOString?.().slice(0, 10) ?? ""
    : "";

  const paymentDay = subscription.paymentDayOfMonth ?? "";

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title="Edit subscription"
      titleId="subscription-modal-title"
      maxWidth="max-w-xl"
      footer={
        <form
          action={deleteSubscription}
          onSubmit={(e) => {
            if (!confirm("Remove this subscription? Schedules and payment records for it will be deleted.")) {
              e.preventDefault();
            }
          }}
          className="inline"
        >
          <input type="hidden" name="subscriptionId" value={subscription.id} />
          <input type="hidden" name="clientId" value={clientId} />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Remove subscription
          </button>
        </form>
      }
    >
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
        <p className="font-medium text-gray-900 dark:text-gray-100">{subscription.service.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {subscription.billingCycle} · Started {startDateStr}
          {endDateStr ? ` · Ends ${endDateStr}` : ""}
        </p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
          {subscription.currency === "DOP" ? "RD$" : "$"}
          {Number(subscription.amount).toLocaleString()}
        </p>
        <p className={`text-xs font-medium mt-1 ${statusStyle(subscription.status)}`}>
          {subscription.status}
        </p>
      </div>

      <form action={updateSubscription} className="space-y-5">
        <input type="hidden" name="subscriptionId" value={subscription.id} />
        <input type="hidden" name="clientId" value={clientId} />

        {/* Pricing: service, amount, currency */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Pricing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Service *</label>
              <select name="serviceId" required defaultValue={subscription.serviceId} className={inputClass}>
                {services.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Amount *</label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                defaultValue={Number(subscription.amount)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Currency</label>
              <select name="currency" defaultValue={subscription.currency} className={inputClass}>
                <option value="DOP">DOP (RD$)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Billing & dates */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Billing & dates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Billing cycle</label>
              <select name="billingCycle" defaultValue={subscription.billingCycle} className={inputClass}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
                <option value="one_time">One-time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Payment day of month (optional)</label>
              <input
                type="number"
                name="paymentDayOfMonth"
                min={1}
                max={31}
                placeholder="e.g. 15"
                defaultValue={paymentDay}
                className={inputClass}
                aria-label="Day of month for payment (1-31)"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Start date *</label>
              <input type="date" name="startDate" required defaultValue={startDateStr} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">End date (optional)</label>
              <input type="date" name="endDate" defaultValue={endDateStr} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Status & actions */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Status
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="sm:w-40">
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
              <select name="status" defaultValue={subscription.status} className={inputClass}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      </form>
    </EditModal>
  );
}
