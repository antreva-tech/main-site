"use client";

/**
 * Modal for editing or deleting a single (one-time) charge.
 * Uses shared EditModal; Remove is in the modal footer.
 */

import { EditModal } from "../../components/EditModal";

export type SingleChargeForModal = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  chargedAt: string;
  status: string;
  notes: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  charge: SingleChargeForModal | null;
  clientId: string;
  updateSingleCharge: (formData: FormData) => Promise<void>;
  deleteSingleCharge: (formData: FormData) => Promise<void>;
};

function statusStyle(status: string): string {
  const map: Record<string, string> = {
    pending: "text-amber-600",
    paid: "text-green-600",
    cancelled: "text-red-600",
  };
  return map[status] ?? "text-gray-600";
}

export function SingleChargeEditModal({
  open,
  onClose,
  charge,
  clientId,
  updateSingleCharge,
  deleteSingleCharge,
}: Props) {
  if (!open || !charge) return null;

  const chargedAtStr =
    typeof charge.chargedAt === "string"
      ? charge.chargedAt.slice(0, 10)
      : (charge.chargedAt as string);

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title="Edit single charge"
      titleId="single-charge-modal-title"
      footer={
        <form
          action={deleteSingleCharge}
          onSubmit={(e) => {
            if (!confirm("Remove this single charge?")) e.preventDefault();
          }}
          className="inline"
        >
          <input type="hidden" name="singleChargeId" value={charge.id} />
          <input type="hidden" name="clientId" value={clientId} />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition"
          >
            Remove charge
          </button>
        </form>
      }
    >
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="font-medium text-gray-900">{charge.description}</p>
        <p className="text-sm text-gray-500 mt-0.5">Charged {chargedAtStr}</p>
        <p className="text-sm font-medium text-gray-700 mt-1">
          {charge.currency === "DOP" ? "RD$" : "$"}
          {Number(charge.amount).toLocaleString()}
        </p>
        <p className={`text-xs font-medium mt-1 ${statusStyle(charge.status)}`}>
          {charge.status}
        </p>
      </div>

      <form action={updateSingleCharge} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="hidden" name="singleChargeId" value={charge.id} />
        <input type="hidden" name="clientId" value={clientId} />
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 uppercase mb-1">Description *</label>
          <input
            type="text"
            name="description"
            required
            defaultValue={charge.description}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            placeholder="e.g. Setup fee, Migration"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Amount *</label>
          <input
            type="number"
            name="amount"
            required
            min="0"
            step="0.01"
            defaultValue={Number(charge.amount)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Currency</label>
          <select
            name="currency"
            defaultValue={charge.currency}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            <option value="DOP">DOP (RD$)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Charge date *</label>
          <input
            type="date"
            name="chargedAt"
            required
            defaultValue={chargedAtStr}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Status</label>
          <select
            name="status"
            defaultValue={charge.status}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 uppercase mb-1">Notes (optional)</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={charge.notes ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            placeholder="Internal notes"
          />
        </div>
        <div className="sm:col-span-2 flex gap-2">
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
