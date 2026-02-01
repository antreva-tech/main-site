/**
 * New Lead Button with Modal
 */

"use client";

import { useState, useTransition } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createLead } from "./actions";
import type { LeadSource } from "@prisma/client";

/**
 * Button that opens new lead modal.
 */
export function NewLeadButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [source, setSource] = useState<LeadSource>("other");

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await createLead(formData);
      setOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="min-h-[44px] w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-[#1C6ED5] text-white rounded-xl hover:bg-[#1559B3] transition font-medium text-sm sm:text-base"
      >
        + {t.dashboard.pipeline.newLead}
      </button>

      {/* Modal - mobile-friendly padding and touch targets */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t.dashboard.pipeline.newLead}
            </h2>

            <form action={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dashboard.pipeline.contactName} *
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                    placeholder={t.dashboard.pipeline.contactName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dashboard.pipeline.companyName}
                  </label>
                  <input
                    name="company"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                    placeholder={t.dashboard.pipeline.companyName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dashboard.pipeline.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dashboard.pipeline.phone}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                    placeholder="+1 809 555 1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dashboard.pipeline.source}
                  </label>
                  <select
                    name="source"
                    value={source}
                    onChange={(e) => setSource(e.target.value as LeadSource)}
                    className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {source === "other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.dashboard.pipeline.sourceOtherPlaceholder}
                    </label>
                    <input
                      name="sourceOther"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                      placeholder={t.dashboard.pipeline.sourceOtherPlaceholder}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dashboard.pipeline.estimatedValue}
                  </label>
                  <input
                    type="number"
                    name="expectedValue"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.dashboard.pipeline.notes}
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                    placeholder={t.dashboard.pipeline.notes}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-[44px] flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  {t.dashboard.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="min-h-[44px] flex-1 px-4 py-2.5 bg-[#1C6ED5] text-white rounded-xl hover:bg-[#1559B3] transition font-medium disabled:opacity-50"
                >
                  {isPending ? t.dashboard.common.creatingLead : t.dashboard.pipeline.createLead}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
