"use client";

/**
 * Project view modal: compact preview with quick stage change and link to full project.
 * Shown when user clicks a development pipeline card (same workflow as LeadViewModal).
 */

import { useTransition, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditModal } from "../components/EditModal";
import { updateDevelopmentProjectStage } from "./actions";
import type { ProjectRow } from "./page";
import type { DevelopmentStage } from "@prisma/client";

const STAGE_KEYS: DevelopmentStage[] = [
  "discovery",
  "design",
  "development",
  "qa",
  "deployment",
  "completed",
  "on_hold",
];

const STAGE_LABELS: Record<DevelopmentStage, string> = {
  discovery: "Discovery",
  design: "Design",
  development: "Development",
  qa: "QA",
  deployment: "Deployment",
  completed: "Completed",
  on_hold: "On Hold",
};

const STAGE_COLORS: Record<DevelopmentStage, string> = {
  discovery: "bg-blue-500",
  design: "bg-cyan-500",
  development: "bg-purple-500",
  qa: "bg-yellow-500",
  deployment: "bg-orange-500",
  completed: "bg-green-500",
  on_hold: "bg-gray-400",
};

type Props = {
  project: ProjectRow;
  open: boolean;
  onClose: () => void;
  /** Called after stage is updated so parent can sync project state. */
  onStageChange?: (newStage: DevelopmentStage) => void;
};

/**
 * Renders a compact project summary with stage dropdown and link to full project page.
 */
export function ProjectViewModal({
  project,
  open,
  onClose,
  onStageChange,
}: Props) {
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

  const handleStageSelect = (newStage: DevelopmentStage) => {
    if (!STAGE_KEYS.includes(newStage) || newStage === project.stage) return;
    setDropdownOpen(false);
    startTransition(async () => {
      await updateDevelopmentProjectStage(project.id, newStage);
      onStageChange?.(newStage);
      router.refresh();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setDropdownOpen(true);
        setHighlightedIndex(STAGE_KEYS.indexOf(project.stage));
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

  const title = project.company || project.clientName;
  const updated = new Date(project.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: project.updatedAt.slice(0, 4) !== new Date().getFullYear().toString() ? "numeric" : undefined,
  });

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title={title}
      titleId="project-view-modal-title"
      maxWidth="max-w-sm"
      scrollContent={true}
    >
      <div className="space-y-4">
        {project.company && (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{project.clientName}</p>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Stage</span>
          <div ref={dropdownRef} className="relative mt-0.5">
            <button
              type="button"
              onClick={() => {
                if (isPending) return;
                setDropdownOpen((o) => {
                  if (!o) setHighlightedIndex(STAGE_KEYS.indexOf(project.stage));
                  return !o;
                });
              }}
              onKeyDown={handleKeyDown}
              disabled={isPending}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              aria-label="Project stage"
              className="w-full min-w-0 flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 px-3 py-2 text-left text-sm text-gray-900 dark:text-gray-100 shadow-sm transition hover:border-gray-400 dark:hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-offset-0 dark:focus:ring-offset-gray-700 disabled:opacity-50"
            >
              <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STAGE_COLORS[project.stage]}`} />
              <span className="flex-1 truncate">{STAGE_LABELS[project.stage]}</span>
              <svg
                className={`h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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
                className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 py-1 shadow-lg"
                aria-label="Project stage"
              >
                {STAGE_KEYS.map((key, i) => (
                  <li
                    key={key}
                    role="option"
                    aria-selected={project.stage === key}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => handleStageSelect(key)}
                    className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition ${
                      project.stage === key
                        ? "bg-[#1C6ED5]/15 dark:bg-[#1C6ED5]/25 text-[#0B132B] dark:text-white font-medium"
                        : highlightedIndex === i
                          ? "bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STAGE_COLORS[key]}`} />
                    {STAGE_LABELS[key]}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <span className="text-gray-500 dark:text-gray-400">Updated</span>
          <span className="text-gray-700 dark:text-gray-300">{updated}</span>
        </div>

        {project.notes && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{project.notes}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Recent activity (last 3)</p>
          {project.recentLogs.length > 0 ? (
            <>
              <ul className="space-y-2">
                {project.recentLogs.map((log) => (
                  <li
                    key={log.id}
                    className="p-2.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-100 dark:border-gray-600 text-sm"
                  >
                    <p className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{log.content}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {log.createdByName} · {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                Add or view all activity on the full project page.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              No activity yet. Add logs on the full project page.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <Link
            href={`/dashboard/development/${project.id}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C6ED5] text-white text-sm font-medium hover:bg-[#1559B3] dark:hover:bg-[#1C6ED5]/90 transition"
          >
            View full project
          </Link>
          <Link
            href={`/dashboard/clients/${project.clientId}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            View client
          </Link>
        </div>
      </div>
    </EditModal>
  );
}
