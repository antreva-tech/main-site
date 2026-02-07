"use client";

/**
 * Create ticket form shown only when user clicks "+ Create ticket". Uses LanguageContext for labels/placeholders.
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  clientId: string;
  createTicket: (formData: FormData) => Promise<void>;
};

export function AddTicketForm({ clientId, createTicket }: Props) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-sm font-semibold text-[#1C6ED5] hover:text-[#1559B3] list-none py-1 mb-6 transition-colors"
        >
          + {t.dashboard.clients.createSupportTicket}
        </button>
      ) : (
        <form
          action={createTicket}
          className="mb-6 p-4 sm:p-5 rounded-xl bg-[#0B132B]/[0.03] border border-[#0B132B]/[0.06]"
          onSubmit={() => setShowForm(false)}
        >
          <p className="text-sm font-semibold text-[#0B132B]/90 mb-3">{t.dashboard.clients.createSupportTicketHeading}</p>
          <input type="hidden" name="clientId" value={clientId} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">{t.dashboard.clients.subject}</label>
              <input
                name="subject"
                required
                className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
                placeholder={t.dashboard.clients.subjectPlaceholder}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">{t.dashboard.tickets.priority}</label>
              <select
                name="priority"
                className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] min-h-[44px] transition-colors"
              >
                <option value="low">{t.dashboard.tickets.priorities.low}</option>
                <option value="medium">{t.dashboard.tickets.priorities.medium}</option>
                <option value="high">{t.dashboard.tickets.priorities.high}</option>
                <option value="urgent">{t.dashboard.tickets.priorities.urgent}</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">{t.dashboard.tickets.initialMessage}</label>
            <textarea
              name="content"
              rows={2}
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
              placeholder={t.dashboard.clients.initialMessagePlaceholder}
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">{t.dashboard.tickets.attachImages}</label>
            <input
              type="file"
              name="attachments"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="w-full px-3 py-2 border border-[#0B132B]/[0.12] rounded-lg text-sm text-[#0B132B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1C6ED5]/10 file:text-[#1C6ED5]"
            />
            <p className="mt-1 text-xs text-[#8A8F98]">{t.dashboard.tickets.attachImagesHint}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[44px] px-4 py-2.5 border border-[#0B132B]/[0.12] text-[#0B132B] text-sm rounded-xl font-medium hover:bg-[#0B132B]/[0.04] transition"
            >
              {t.dashboard.common.cancel}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2.5 bg-[#1C6ED5] text-white text-sm rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all"
            >
              {t.dashboard.clients.createTicketSubmit}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
