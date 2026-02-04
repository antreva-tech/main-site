"use client";

/**
 * Lead view modal: compact card-style preview with quick stage change,
 * Call, WhatsApp follow-up, and Edit. Shown when user clicks a Kanban card on desktop.
 */

import { useTransition, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { EditModal } from "../components/EditModal";
import { updateLeadStage } from "./actions";
import type { LeadRow } from "./PipelineBoard";
import type { LeadStage } from "@prisma/client";

const STAGE_KEYS: LeadStage[] = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

/** Stage dot colors (match pipeline column headers). */
const STAGE_COLORS: Record<LeadStage, string> = {
  new: "bg-blue-500",
  qualified: "bg-cyan-500",
  proposal: "bg-purple-500",
  negotiation: "bg-yellow-500",
  won: "bg-green-500",
  lost: "bg-gray-400",
};

/** Builds wa.me URL from phone; assumes DR (1809) if 9 digits. */
function whatsAppUrl(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) return null;
  const normalized =
    digits.length === 9 && digits.startsWith("809")
      ? "1" + digits
      : digits.length === 7
        ? "1809" + digits
        : digits;
  return `https://wa.me/${normalized}`;
}

function sourceDisplay(source: string, sourceOther: string | null): string {
  return source === "other" && sourceOther ? sourceOther : source.replace(/_/g, " ");
}

type Props = {
  lead: LeadRow;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  /** Called after stage is updated so parent can sync lead state (e.g. update modal lead.stage). */
  onStageChange?: (newStage: LeadStage) => void;
  /** When user selects Won, open convert modal instead of updating stage. Parent opens ConvertToClientModal. */
  onRequestConvert?: (lead: LeadRow) => void;
};

/**
 * Renders a compact read-only lead summary with Call, WhatsApp, and Edit actions.
 */
export function LeadViewModal({ lead, open, onClose, onEdit, onStageChange, onRequestConvert }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [dropdownOpen]);

  const handleStageSelect = (newStage: LeadStage) => {
    if (!STAGE_KEYS.includes(newStage) || newStage === lead.stage) return;
    setDropdownOpen(false);
    if (newStage === "won") {
      onRequestConvert?.(lead);
      onClose();
      return;
    }
    startTransition(async () => {
      try {
        await updateLeadStage(lead.id, newStage);
        onStageChange?.(newStage);
        router.refresh();
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to update stage");
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setDropdownOpen(true);
        setHighlightedIndex(STAGE_KEYS.indexOf(lead.stage));
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < STAGE_KEYS.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : STAGE_KEYS.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleStageSelect(STAGE_KEYS[highlightedIndex]);
    }
  };

  const created = new Date(lead.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: lead.createdAt.slice(0, 4) !== new Date().getFullYear().toString() ? "numeric" : undefined,
  });
  const waUrl = whatsAppUrl(lead.phone);
  const canCall = Boolean(lead.phone);

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title={lead.name}
      titleId="lead-view-modal-title"
      maxWidth="max-w-sm"
      scrollContent={false}
      allowContentOverflow={true}
    >
      <div className="space-y-4">
        {/* Card summary */}
        {lead.company && (
          <p className="text-sm text-gray-600 truncate">{lead.company}</p>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {lead.email && (
            <>
              <span className="text-gray-500">{t.dashboard.pipeline.email}</span>
              <a
                href={`mailto:${lead.email}`}
                className="text-tech-blue hover:underline truncate block"
              >
                {lead.email}
              </a>
            </>
          )}
          {lead.phone && (
            <>
              <span className="text-gray-500">{t.dashboard.pipeline.phone}</span>
              <a
                href={`tel:${lead.phone}`}
                className="text-tech-blue hover:underline truncate block"
              >
                {lead.phone}
              </a>
            </>
          )}
          <span className="text-gray-500">{t.dashboard.pipeline.source}</span>
          <span className={lead.source === "other" && lead.sourceOther ? "" : "capitalize"}>
            {sourceDisplay(lead.source, lead.sourceOther)}
            {lead.source === "referral" && lead.referralFrom && (
              <span className="block text-sm text-gray-600 mt-0.5">
                {t.dashboard.pipeline.referralFromLabel}: {lead.referralFrom}
              </span>
            )}
          </span>
          {lead.lineOfBusiness && (
            <>
              <span className="text-gray-500">{t.dashboard.common.lineOfBusiness}</span>
              <span className="capitalize">
                {t.dashboard.common.lineOfBusinessOptions[lead.lineOfBusiness as keyof typeof t.dashboard.common.lineOfBusinessOptions]}
              </span>
            </>
          )}
          <span className="text-gray-500">{t.dashboard.pipeline.stage}</span>
          <span className="sm:col-span-1" ref={dropdownRef}>
            {lead.stage === "won" ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STAGE_COLORS.won}`} />
                <span className="text-sm font-medium text-gray-900">{t.dashboard.pipeline.stages.won}</span>
                {lead.convertedClientId && (
                  <Link
                    href={`/dashboard/clients/${lead.convertedClientId}`}
                    className="text-sm text-[#1C6ED5] hover:underline ml-1"
                  >
                    View client →
                  </Link>
                )}
              </div>
            ) : (
              <div className="relative mt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (isPending) return;
                    setDropdownOpen((o) => {
                      if (!o) setHighlightedIndex(STAGE_KEYS.indexOf(lead.stage));
                      return !o;
                    });
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={isPending}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                  aria-label={t.dashboard.pipeline.stage}
                  className="w-full min-w-0 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 shadow-sm transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-tech-blue focus:ring-offset-0 disabled:opacity-50"
                >
                  <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STAGE_COLORS[lead.stage]}`} />
                  <span className="flex-1 truncate">{t.dashboard.pipeline.stages[lead.stage]}</span>
                  <svg
                    className={`h-4 w-4 flex-shrink-0 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    aria-label={t.dashboard.pipeline.stage}
                  >
                    {STAGE_KEYS.map((key, i) => (
                      <li
                        key={key}
                        role="option"
                        aria-selected={lead.stage === key}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        onClick={() => handleStageSelect(key)}
                        className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition ${
                          lead.stage === key
                            ? "bg-tech-blue/10 text-midnight-navy font-medium"
                            : highlightedIndex === i
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STAGE_COLORS[key]}`} />
                        {t.dashboard.pipeline.stages[key]}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </span>
          {lead.expectedValue != null && lead.expectedValue > 0 && (
            <>
              <span className="text-gray-500">{t.dashboard.pipeline.estimatedValue}</span>
              <span className="font-medium text-green-600">
                RD${lead.expectedValue.toLocaleString()}
              </span>
            </>
          )}
          <span className="text-gray-500">Created</span>
          <span>{created}</span>
        </div>
        {lead.notes && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.pipeline.notes}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{lead.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          {canCall && (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t.dashboard.pipeline.call}
            </a>
          )}
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#20BD5A] transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t.dashboard.pipeline.whatsappFollowUp}
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-tech-blue text-white text-sm font-medium hover:bg-tech-blue/90 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t.dashboard.common.edit}
          </button>
        </div>
      </div>
    </EditModal>
  );
}
