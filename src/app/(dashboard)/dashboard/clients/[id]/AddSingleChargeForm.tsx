"use client";

/**
 * Add single charge form shown only when user clicks "+ Add single charge".
 */

import { useState } from "react";

type Props = {
  clientId: string;
  createSingleCharge: (formData: FormData) => Promise<void>;
};

export function AddSingleChargeForm({ clientId, createSingleCharge }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-sm font-semibold text-[#1C6ED5] hover:text-[#1559B3] list-none py-1 transition-colors"
        >
          + Add single charge
        </button>
      ) : (
        <form
          action={createSingleCharge}
          className="mt-4 p-4 sm:p-5 rounded-xl bg-[#0B132B]/[0.03] border border-[#0B132B]/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3"
          onSubmit={() => setShowForm(false)}
        >
          <input type="hidden" name="clientId" value={clientId} />
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Description *</label>
            <input
              name="description"
              required
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
              placeholder="e.g. Setup fee, Website migration"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Amount *</label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Currency</label>
            <select
              name="currency"
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
            >
              <option value="DOP">DOP (RD$)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Charge date *</label>
            <input
              type="date"
              name="chargedAt"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Status</label>
            <select
              name="status"
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Notes (optional)</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
              placeholder="Internal notes"
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[44px] px-4 py-2.5 border border-[#0B132B]/[0.12] text-[#0B132B] text-sm rounded-xl font-medium hover:bg-[#0B132B]/[0.04] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2.5 bg-[#1C6ED5] text-white text-sm rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all"
            >
              Add single charge
            </button>
          </div>
        </form>
      )}
    </>
  );
}
