"use client";

/**
 * Edit lead modal: full form for name, company, email, phone, source, stage,
 * expected value, notes, and lost reason (when stage is lost).
 * Used when clicking a Kanban card on desktop.
 */

import { useState, useTransition } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { EditModal } from "../components/EditModal";
import { updateLead } from "./actions";
import type { LeadRow } from "./PipelineBoard";
import type { LeadStage, LeadSource } from "@prisma/client";
import { LINE_OF_BUSINESS_VALUES } from "@/lib/lineOfBusiness";

const SOURCE_OPTIONS: Array<{ value: LeadStage; labelKey: LeadStage }> = [
  { value: "new", labelKey: "new" },
  { value: "qualified", labelKey: "qualified" },
  { value: "proposal", labelKey: "proposal" },
  { value: "negotiation", labelKey: "negotiation" },
  { value: "won", labelKey: "won" },
  { value: "lost", labelKey: "lost" },
];

type Props = {
  lead: LeadRow;
  open: boolean;
  onClose: () => void;
};

/**
 * Renders a modal with form to edit all lead fields; submits via updateLead action.
 */
export function EditLeadModal({ lead, open, onClose }: Props) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [stage, setStage] = useState<LeadStage>(lead.stage);
  const [source, setSource] = useState<LeadSource>(lead.source as LeadSource);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await updateLead(lead.id, formData);
      onClose();
    });
  };

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title={t.dashboard.common.editLead}
      titleId="edit-lead-modal-title"
      maxWidth="max-w-xl"
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.pipeline.contactName} *
          </label>
          <input
            name="name"
            required
            defaultValue={lead.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            placeholder={t.dashboard.pipeline.contactName}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.pipeline.companyName}
          </label>
          <input
            name="company"
            defaultValue={lead.company ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            placeholder={t.dashboard.pipeline.companyName}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.pipeline.email}
          </label>
          <input
            type="email"
            name="email"
            defaultValue={lead.email ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.pipeline.phone}
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={lead.phone ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            placeholder="+1 809 555 1234"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.pipeline.source}
          </label>
          <select
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value as LeadSource)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="cold_outreach">Cold Outreach</option>
            <option value="other">Other</option>
          </select>
        </div>
        {source === "other" && (
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">
              {t.dashboard.pipeline.sourceOtherPlaceholder}
            </label>
            <input
              name="sourceOther"
              defaultValue={lead.sourceOther ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.pipeline.sourceOtherPlaceholder}
            />
          </div>
        )}
        {source === "referral" && (
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">
              {t.dashboard.pipeline.referralFromPlaceholder}
            </label>
            <input
              name="referralFrom"
              defaultValue={lead.referralFrom ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.pipeline.referralFromPlaceholder}
            />
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.common.lineOfBusiness}
          </label>
          <select
            name="lineOfBusiness"
            defaultValue={lead.lineOfBusiness ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            <option value="">—</option>
            {LINE_OF_BUSINESS_VALUES.map((value) => (
              <option key={value} value={value}>
                {t.dashboard.common.lineOfBusinessOptions[value as keyof typeof t.dashboard.common.lineOfBusinessOptions]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.pipeline.stage}
          </label>
          <select
            name="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as LeadStage)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t.dashboard.pipeline.stages[opt.labelKey]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.pipeline.estimatedValue}
          </label>
          <input
            type="number"
            name="expectedValue"
            step="0.01"
            defaultValue={lead.expectedValue ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            placeholder="0.00"
          />
        </div>
        {stage === "lost" && (
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">
              {t.dashboard.pipeline.lostReason}
            </label>
            <input
              name="lostReason"
              defaultValue={lead.lostReason ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.pipeline.lostReason}
            />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 uppercase mb-1">
            {t.dashboard.pipeline.notes}
          </label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={lead.notes ?? ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            placeholder={t.dashboard.pipeline.notes}
          />
        </div>
        <div className="sm:col-span-2 flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="px-3 py-1.5 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium disabled:opacity-50"
          >
            {t.dashboard.common.saveChanges}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
          >
            {t.dashboard.common.cancel}
          </button>
        </div>
      </form>
    </EditModal>
  );
}
