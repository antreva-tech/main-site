/**
 * Lead Stage Selector Component
 * Won is not selectable here; use Convert to Client to move to Won. Once won, stage is locked.
 */

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStage } from "../actions";
import type { LeadStage } from "@prisma/client";

/** Stages that can be set from this dropdown. Won is only set via Convert to Client. */
const STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "lost", label: "Lost" },
];

/**
 * Dropdown to change lead stage. When current stage is Won, selector is disabled (stage is final).
 */
export function LeadStageSelector({
  leadId,
  currentStage,
}: {
  leadId: string;
  currentStage: LeadStage;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isWon = currentStage === "won";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as LeadStage;
    startTransition(async () => {
      await updateLeadStage(leadId, newStage);
      router.refresh();
    });
  };

  if (isWon) {
    return (
      <span className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
        Won
      </span>
    );
  }

  return (
    <select
      value={currentStage}
      onChange={handleChange}
      disabled={isPending}
      className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1C6ED5] disabled:opacity-50"
    >
      {STAGES.map((stage) => (
        <option key={stage.key} value={stage.key}>
          {stage.label}
        </option>
      ))}
    </select>
  );
}
