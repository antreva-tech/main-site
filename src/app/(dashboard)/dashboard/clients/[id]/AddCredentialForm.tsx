"use client";

/**
 * Add credential form shown only when user clicks "+ Add credential".
 */

import { useState } from "react";

type Props = {
  clientId: string;
  createCredential: (formData: FormData) => Promise<void>;
};

export function AddCredentialForm({ clientId, createCredential }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-sm font-semibold text-[#1C6ED5] hover:text-[#1559B3] list-none py-1 transition-colors"
        >
          + Add credential
        </button>
      ) : (
        <form
          action={createCredential}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-5 rounded-xl bg-[#0B132B]/[0.03] border border-[#0B132B]/[0.06]"
          onSubmit={() => setShowForm(false)}
        >
          <input type="hidden" name="clientId" value={clientId} />
          <div>
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Label *</label>
            <input
              name="label"
              required
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
              placeholder="e.g. Admin panel, cPanel"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Value (password / URL) *</label>
            <input
              type="password"
              name="value"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
              placeholder="Encrypted at rest"
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
              Add credential
            </button>
          </div>
        </form>
      )}
    </>
  );
}
