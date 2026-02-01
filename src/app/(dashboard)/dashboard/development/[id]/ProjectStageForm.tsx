"use client";

/**
 * Form to update development project stage and notes. CTO only (enforced in action).
 */

import { useTransition } from "react";
import { updateDevelopmentProject } from "../actions";
import type { DevelopmentStage } from "@prisma/client";

const STAGES: { value: DevelopmentStage; label: string }[] = [
  { value: "discovery", label: "Discovery" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "qa", label: "QA" },
  { value: "deployment", label: "Deployment" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

type Props = {
  projectId: string;
  currentStage: DevelopmentStage;
  currentNotes: string;
};

/**
 * Renders stage select and notes textarea; submits via server action.
 */
export function ProjectStageForm({
  projectId,
  currentStage,
  currentNotes,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await updateDevelopmentProject(projectId, formData);
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs text-gray-500 uppercase mb-1">
          Stage
        </label>
        <select
          name="stage"
          defaultValue={currentStage}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 uppercase mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={currentNotes}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
          placeholder="Internal notes about this project..."
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
