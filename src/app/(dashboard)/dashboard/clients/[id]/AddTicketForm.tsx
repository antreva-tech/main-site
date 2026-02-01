"use client";

/**
 * Create ticket form shown only when user clicks "+ Create ticket".
 */

import { useState } from "react";

type Props = {
  clientId: string;
  createTicket: (formData: FormData) => Promise<void>;
};

export function AddTicketForm({ clientId, createTicket }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-sm font-semibold text-[#1C6ED5] hover:text-[#1559B3] list-none py-1 mb-6 transition-colors"
        >
          + Create ticket
        </button>
      ) : (
        <form
          action={createTicket}
          className="mb-6 p-4 sm:p-5 rounded-xl bg-[#0B132B]/[0.03] border border-[#0B132B]/[0.06]"
          onSubmit={() => setShowForm(false)}
        >
          <p className="text-sm font-semibold text-[#0B132B]/90 mb-3">Create support ticket</p>
          <input type="hidden" name="clientId" value={clientId} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Subject *</label>
              <input
                name="subject"
                required
                className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Priority</label>
              <select
                name="priority"
                className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] min-h-[44px] transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">Initial message (optional)</label>
            <textarea
              name="content"
              rows={2}
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
              placeholder="Add details..."
            />
          </div>
          <div className="flex gap-2">
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
              Create ticket
            </button>
          </div>
        </form>
      )}
    </>
  );
}
