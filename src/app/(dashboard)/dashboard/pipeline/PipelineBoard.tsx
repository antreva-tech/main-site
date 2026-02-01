"use client";

/**
 * Pipeline board: mobile-first stage selector + vertical list on small screens,
 * Kanban columns on md+.
 */

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LeadStage } from "@prisma/client";

/** Stage config (label + accent color). */
export type StageConfig = { key: LeadStage; label: string; color: string };

/** Lead row for display (dates serialized). */
export type LeadRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  stage: LeadStage;
  expectedValue: number | null;
  source: string;
  createdAt: string;
};

type Props = {
  stages: StageConfig[];
  leadsByStage: Record<LeadStage, LeadRow[]>;
};

/**
 * Renders pipeline: on mobile, stage pills + vertical list of leads;
 * on md+, horizontal Kanban columns.
 */
export function PipelineBoard({ stages, leadsByStage }: Props) {
  const { t } = useLanguage();
  const [selectedStage, setSelectedStage] = useState<LeadStage>("new");
  const leads = leadsByStage[selectedStage] ?? [];
  const stageLabel = stages.find((s) => s.key === selectedStage)?.label ?? selectedStage;

  return (
    <div className="min-w-0">
      {/* Mobile: stage selector + vertical list */}
      <div className="md:hidden">
        {/* Stage pills - horizontal scroll with snap */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
          {stages.map((stage) => {
            const count = (leadsByStage[stage.key] ?? []).length;
            const isActive = selectedStage === stage.key;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => setSelectedStage(stage.key)}
                aria-label={t.dashboard.pipeline.stages[stage.key]}
                className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-[#0B132B] text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-[#1C6ED5]/40 hover:bg-gray-50"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stage.color}`} />
                <span>{t.dashboard.pipeline.stages[stage.key]}</span>
                <span
                  className={`min-w-[1.25rem] text-center text-xs rounded-full px-1.5 py-0.5 ${
                    isActive ? "bg-white/20" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Lead list for selected stage */}
        <div className="mt-4 space-y-3">
          {leads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 px-6 py-12 text-center">
              <p className="text-gray-500 text-sm">{t.dashboard.pipeline.noLeadsInStage} {stageLabel}</p>
              <p className="text-gray-400 text-xs mt-1">{t.dashboard.pipeline.addLeadOrSwitch}</p>
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} variant="list" />
            ))
          )}
        </div>
      </div>

      {/* Desktop: Kanban */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 min-h-0 -mx-1 px-1" style={{ scrollbarGutter: "stable" }}>
        {stages.map((stage) => (
          <div
            key={stage.key}
            className="flex-shrink-0 min-w-[260px] w-72 bg-gray-100 rounded-xl"
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stage.color}`} />
                <h3 className="font-semibold text-gray-700 truncate">{t.dashboard.pipeline.stages[stage.key]}</h3>
                <span className="ml-auto text-sm text-gray-500 flex-shrink-0">
                  {(leadsByStage[stage.key] ?? []).length}
                </span>
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-[360px]">
              {(leadsByStage[stage.key] ?? []).map((lead) => (
                <LeadCard key={lead.id} lead={lead} variant="kanban" />
              ))}
              {(leadsByStage[stage.key] ?? []).length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">{t.dashboard.pipeline.noLeads}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Lead card: compact in Kanban, premium (larger tap target, more info) in list.
 */
function LeadCard({
  lead,
  variant,
}: {
  lead: LeadRow;
  variant: "kanban" | "list";
}) {
  const created = new Date(lead.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: lead.createdAt.slice(0, 4) !== new Date().getFullYear().toString() ? "numeric" : undefined,
  });

  if (variant === "list") {
    return (
      <Link
        href={`/dashboard/pipeline/${lead.id}`}
        className="block bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50 transition shadow-sm hover:shadow-md hover:border-gray-300 min-h-[88px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{lead.name}</p>
            {lead.company && (
              <p className="text-sm text-gray-500 truncate mt-0.5">{lead.company}</p>
            )}
          </div>
          {lead.expectedValue != null && lead.expectedValue > 0 && (
            <span className="flex-shrink-0 text-sm font-semibold text-green-600">
              RD${lead.expectedValue.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{lead.source.replace("_", " ")}</span>
          <span>{created}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/pipeline/${lead.id}`}
      className="block bg-white p-3 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition"
    >
      <h4 className="font-medium text-gray-900 truncate">{lead.name}</h4>
      {lead.company && (
        <p className="text-sm text-gray-500 truncate">{lead.company}</p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-gray-400 capitalize">{lead.source.replace("_", " ")}</span>
        {lead.expectedValue != null && lead.expectedValue > 0 && (
          <span className="font-medium text-green-600">
            RD${lead.expectedValue.toLocaleString()}
          </span>
        )}
      </div>
    </Link>
  );
}
