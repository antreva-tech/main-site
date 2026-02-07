"use client";

/**
 * Development pipeline board: drag-and-drop between stages; click card opens ProjectViewModal.
 * Matches sales pipeline workflow (DndContext, DragOverlay, droppable columns, draggable cards).
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { DevelopmentStage } from "@prisma/client";
import { ProjectViewModal } from "./ProjectViewModal";
import { updateDevelopmentProjectStage } from "./actions";
import type { ProjectRow } from "./page";

type StageConfig = { key: DevelopmentStage; label: string; color: string };

type Props = {
  stages: StageConfig[];
  projectsByStage: Record<DevelopmentStage, ProjectRow[]>;
};

/** Droppable column for a development stage (desktop Kanban). */
function DroppableColumn({
  stageKey,
  children,
  className,
}: {
  stageKey: DevelopmentStage;
  children: React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stageKey });
  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ""} ${isOver ? "ring-2 ring-[#1C6ED5] ring-inset rounded-xl" : ""}`}
    >
      {children}
    </div>
  );
}

/** Draggable project card with handle; click (non-handle) opens view modal. */
function DraggableProjectCard({
  project,
  onView,
}: {
  project: ProjectRow;
  onView: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: project.id,
    data: { projectId: project.id, currentStage: project.stage },
  });
  const displayName = project.company || project.clientName;
  return (
    <div
      ref={setNodeRef}
      className={`bg-white dark:bg-gray-800/95 rounded-lg border border-gray-200 dark:border-gray-500/70 overflow-hidden shadow-sm dark:shadow-md dark:shadow-black/25 ${isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-400 dark:hover:shadow-lg dark:hover:shadow-black/30"} transition`}
    >
      <div className="flex">
        <button
          type="button"
          aria-label="Drag to move"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/80 cursor-grab active:cursor-grabbing touch-none"
          {...listeners}
          {...attributes}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm6-12a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onView}
          className="flex-1 min-w-0 text-left p-3 pr-2 focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-inset rounded-r-lg"
        >
          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
          {project.company && (
            <p className="text-xs text-gray-500 dark:text-gray-300 truncate mt-0.5">{project.clientName}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
            Updated {project.updatedAtDisplay}
          </p>
        </button>
      </div>
    </div>
  );
}

/**
 * Renders development pipeline: mobile stage pills + list; desktop Kanban with drag-and-drop and click-to-view modal.
 */
export function DevelopmentBoard({ stages, projectsByStage }: Props) {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<DevelopmentStage>("discovery");
  const [projectToView, setProjectToView] = useState<ProjectRow | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectRow | null>(null);

  const projects = projectsByStage[selectedStage] ?? [];
  const stageLabel = stages.find((s) => s.key === selectedStage)?.label ?? selectedStage;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const allProjects = stages.flatMap((s) => projectsByStage[s.key] ?? []);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id;
    const project =
      typeof id === "string" ? allProjects.find((p) => p.id === id) ?? null : null;
    setActiveProject(project);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);
    if (!over || over.id === active.id) return;
    const projectId = active.data.current?.projectId as string | undefined;
    const currentStage = active.data.current?.currentStage as DevelopmentStage | undefined;
    const newStage = over.id as DevelopmentStage;
    const isValidStage = stages.some((s) => s.key === newStage);
    if (!projectId || !currentStage || !isValidStage || newStage === currentStage) return;
    await updateDevelopmentProjectStage(projectId, newStage);
    router.refresh();
  };

  return (
    <div className="min-w-0 flex-1 min-h-0 flex flex-col">
      {/* Mobile: stage selector + vertical list */}
      <div className="md:hidden flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
          {stages.map((stage) => {
            const count = (projectsByStage[stage.key] ?? []).length;
            const isActive = selectedStage === stage.key;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => setSelectedStage(stage.key)}
                aria-label={stage.label}
                className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-[#0B132B] dark:bg-gray-700 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-[#1C6ED5]/40 dark:hover:border-[#1C6ED5]/50 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stage.color}`} />
                <span>{stage.label}</span>
                <span
                  className={`min-w-[1.25rem] text-center text-xs rounded-full px-1.5 py-0.5 ${
                    isActive ? "bg-white/20" : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-3">
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-200 dark:border-gray-500/70 px-6 py-12 text-center shadow-sm dark:shadow-md dark:shadow-black/25">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No projects in {stageLabel}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start a project from a client page</p>
            </div>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setProjectToView(project)}
                className="w-full text-left bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-200 dark:border-gray-500/70 p-4 active:bg-gray-50 dark:active:bg-gray-700 transition shadow-sm dark:shadow-md dark:shadow-black/25 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-400 min-h-[88px]"
              >
                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {project.company || project.clientName}
                </p>
                {project.company && (
                  <p className="text-sm text-gray-500 dark:text-gray-300 truncate mt-0.5">{project.clientName}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Updated {project.updatedAtDisplay}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Desktop: Kanban with drag-and-drop */}
      <div className="hidden md:flex flex-1 min-h-0 flex-col -mx-1 px-1">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="pipeline-kanban-scroll flex-1 min-h-0 flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <DroppableColumn
                key={stage.key}
                stageKey={stage.key}
                className="flex-shrink-0 min-w-[260px] w-72 bg-gray-100 dark:bg-gray-800/80 rounded-xl flex flex-col h-full min-h-0"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stage.color}`} />
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 truncate">{stage.label}</h3>
                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {(projectsByStage[stage.key] ?? []).length}
                    </span>
                  </div>
                </div>
                <div className="pipeline-column-scroll flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
                  {(projectsByStage[stage.key] ?? []).map((project) => (
                    <DraggableProjectCard
                      key={project.id}
                      project={project}
                      onView={() => setProjectToView(project)}
                    />
                  ))}
                  {(projectsByStage[stage.key] ?? []).length === 0 && (
                    <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No projects</p>
                  )}
                </div>
              </DroppableColumn>
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeProject ? (
              <div className="bg-white dark:bg-gray-800/95 rounded-lg border-2 border-[#1C6ED5] shadow-xl dark:shadow-2xl dark:shadow-black/40 p-3 w-72 opacity-95 cursor-grabbing">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activeProject.company || activeProject.clientName}
                </p>
                {activeProject.company && (
                  <p className="text-xs text-gray-500 dark:text-gray-300 truncate mt-0.5">{activeProject.clientName}</p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                  Updated {activeProject.updatedAtDisplay}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {projectToView && (
        <ProjectViewModal
          project={projectToView}
          open={true}
          onClose={() => setProjectToView(null)}
          onStageChange={(newStage) => {
            setProjectToView((prev) =>
              prev ? { ...prev, stage: newStage } : null
            );
          }}
        />
      )}
    </div>
  );
}
