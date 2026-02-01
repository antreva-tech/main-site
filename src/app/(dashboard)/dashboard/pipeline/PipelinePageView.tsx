"use client";

/**
 * Pipeline page view: header + New Lead button + PipelineBoard.
 * Uses translations for title and CTA.
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { NewLeadButton } from "./NewLeadButton";
import { PipelineBoard } from "./PipelineBoard";
import type { LeadRow, StageConfig } from "./PipelineBoard";

type Props = {
  stages: StageConfig[];
  leadsByStage: Record<string, LeadRow[]>;
};

/**
 * Renders pipeline header and board with translated strings.
 */
export function PipelinePageView({ stages, leadsByStage }: Props) {
  const { t } = useLanguage();

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
          {t.dashboard.pipeline.salesPipeline}
        </h1>
        <NewLeadButton />
      </div>
      <PipelineBoard stages={stages} leadsByStage={leadsByStage} />
    </div>
  );
}
