"use client";

/**
 * Modal for editing or deleting a client subscription.
 * Uses shared EditModal; Remove is in the modal footer.
 */

import { EditModal } from "../../components/EditModal";

export type SubscriptionForModal = {
  id: string;
  serviceId: string;
  service: { id: string; name: string };
  amount: unknown;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
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
    active: "text-green-600",
    paused: "text-yellow-600",
    cancelled: "text-red-600",
    expired: "text-gray-500",
  };
  return map[status] ?? "text-gray-600";
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

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title="Edit subscription"
      titleId="subscription-modal-title"
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
            className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition"
          >
            Remove subscription
          </button>
        </form>
      }
    >
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="font-medium text-gray-900">{subscription.service.name}</p>
        <p className="text-sm text-gray-500">
          {subscription.billingCycle} · Started {startDateStr}
          {endDateStr ? ` · Ends ${endDateStr}` : ""}
        </p>
        <p className="text-sm font-medium text-gray-700 mt-1">
          {subscription.currency === "DOP" ? "RD$" : "$"}
          {Number(subscription.amount).toLocaleString()}
        </p>
        <p className={`text-xs font-medium mt-1 ${statusStyle(subscription.status)}`}>
          {subscription.status}
        </p>
      </div>

      <form action={updateSubscription} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input type="hidden" name="subscriptionId" value={subscription.id} />
        <input type="hidden" name="clientId" value={clientId} />
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Service *</label>
          <select
            name="serviceId"
            required
            defaultValue={subscription.serviceId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            {services.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Amount *</label>
          <input
            type="number"
            name="amount"
            required
            min="0"
            step="0.01"
            defaultValue={Number(subscription.amount)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Currency</label>
          <select
            name="currency"
            defaultValue={subscription.currency}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            <option value="DOP">DOP (RD$)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Billing cycle</label>
          <select
            name="billingCycle"
            defaultValue={subscription.billingCycle}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
            <option value="one_time">One-time</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Start date *</label>
          <input
            type="date"
            name="startDate"
            required
            defaultValue={startDateStr}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">End date (optional)</label>
          <input
            type="date"
            name="endDate"
            defaultValue={endDateStr}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Status</label>
          <select
            name="status"
            defaultValue={subscription.status}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex items-end gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </EditModal>
  );
}
