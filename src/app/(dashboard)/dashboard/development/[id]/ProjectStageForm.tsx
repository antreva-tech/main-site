"use client";

/**
 * Form to update development project stage (and optionally notes if CTO).
 * Developer: stage selector only.
 * CTO: stage + notes.
 */

import { useTransition } from "react";
import { updateDevelopmentProject } from "../actions";
import type { DevelopmentStage } from "@/generated/prisma/client";

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
  /** CTO can edit notes; Developer cannot. */
  canEditNotes: boolean;
};

/**
 * Renders stage select and (for CTO) notes textarea; submits via server action.
 */
export function ProjectStageForm({
  projectId,
  currentStage,
  currentNotes,
  canEditNotes,
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
        <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
          Stage
        </label>
        <select
          name="stage"
          defaultValue={currentStage}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] focus:border-transparent"
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes: editable for CTO, read-only display for Developer */}
      {canEditNotes ? (
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={currentNotes}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-transparent"
            placeholder="Internal notes about this project..."
          />
        </div>
      ) : currentNotes ? (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Notes</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/60 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
            {currentNotes}
          </p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] dark:hover:bg-[#1C6ED5]/90 transition font-medium disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
