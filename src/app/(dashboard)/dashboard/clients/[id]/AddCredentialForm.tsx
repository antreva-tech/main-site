"use client";

/**
 * Add credential form shown only when user clicks "+ Add credential". Uses LanguageContext for labels/placeholders.
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  clientId: string;
  createCredential: (formData: FormData) => Promise<void>;
};

export function AddCredentialForm({ clientId, createCredential }: Props) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-sm font-semibold text-[#1C6ED5] hover:text-[#1559B3] list-none py-1 transition-colors"
        >
          + {t.dashboard.clients.addCredential}
        </button>
      ) : (
        <form
          action={createCredential}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 sm:p-5 rounded-xl bg-[#0B132B]/[0.03] dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10"
          onSubmit={() => setShowForm(false)}
        >
          <input type="hidden" name="clientId" value={clientId} />
          <div>
            <label className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5">{t.dashboard.clients.label} *</label>
            <input
              name="label"
              required
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 dark:bg-white/5 placeholder:text-[#8A8F98] placeholder:dark:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
              placeholder={t.dashboard.clients.labelPlaceholder}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5">{t.dashboard.clients.valueLabel} *</label>
            <input
              type="password"
              name="value"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 dark:bg-white/5 placeholder:text-[#8A8F98] placeholder:dark:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition"
              placeholder={t.dashboard.clients.valuePlaceholder}
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[44px] px-4 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 text-[#0B132B] dark:text-gray-200 text-sm rounded-xl font-medium hover:bg-[#0B132B]/[0.04] dark:hover:bg-white/10 transition"
            >
              {t.dashboard.common.cancel}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2.5 bg-[#1C6ED5] text-white text-sm rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all"
            >
              {t.dashboard.clients.addCredentialSubmit}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
