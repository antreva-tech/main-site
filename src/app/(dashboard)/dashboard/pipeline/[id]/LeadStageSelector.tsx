/**
 * Lead Stage Selector Component
 */

"use client";

import { useTransition } from "react";
import { updateLeadStage } from "../actions";
import type { LeadStage } from "@prisma/client";

const STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "qualified", label: "Qualified" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

/**
 * Dropdown to change lead stage.
 */
export function LeadStageSelector({
  leadId,
  currentStage,
}: {
  leadId: string;
  currentStage: LeadStage;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as LeadStage;
    startTransition(() => {
      updateLeadStage(leadId, newStage);
    });
  };

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
