"use client";

/**
 * Pipeline board: mobile-first stage selector + vertical list on small screens,
 * Kanban columns on md+. Desktop Kanban: drag cards between stages; click opens LeadViewModal.
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
} from "@dnd-kit/core";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LeadStage } from "@prisma/client";
import { EditLeadModal } from "./EditLeadModal";
import { LeadViewModal } from "./LeadViewModal";
import { updateLeadStage } from "./actions";

/** Stage config (label + accent color). */
export type StageConfig = { key: LeadStage; label: string; color: string };

/** Lead row for display (dates serialized). */
export type LeadRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  stage: LeadStage;
  source: string;
  sourceOther: string | null;
  notes: string | null;
  lostReason: string | null;
  expectedValue: number | null;
  createdAt: string;
};

type Props = {
  stages: StageConfig[];
  leadsByStage: Record<LeadStage, LeadRow[]>;
};

/** Display label for source: custom value when source is "other", else enum label. */
function sourceDisplay(source: string, sourceOther: string | null): string {
  return source === "other" && sourceOther ? sourceOther : source.replace(/_/g, " ");
}

/** Droppable column for a pipeline stage (desktop Kanban). */
function DroppableColumn({
  stageKey,
  children,
  className,
}: {
  stageKey: LeadStage;
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

/** Draggable lead card with handle; click (non-handle) opens view modal. */
function DraggableLeadCard({
  lead,
  onView,
}: {
  lead: LeadRow;
  onView: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { leadId: lead.id, currentStage: lead.stage },
  });
  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md hover:border-gray-300"} transition`}
    >
      <div className="flex">
        <button
          type="button"
          aria-label="Drag to move"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-grab active:cursor-grabbing touch-none"
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
          className="flex-1 min-w-0 text-left p-3 pr-2 focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-inset rounded-r-xl"
        >
          <h4 className="font-medium text-gray-900 truncate">{lead.name}</h4>
          {lead.company && (
            <p className="text-sm text-gray-500 truncate">{lead.company}</p>
          )}
          {lead.phone && (
            <p className="text-xs text-gray-500 truncate">{lead.phone}</p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={lead.source === "other" && lead.sourceOther ? "text-gray-400" : "text-gray-400 capitalize"}>
              {sourceDisplay(lead.source, lead.sourceOther)}
            </span>
            {lead.expectedValue != null && lead.expectedValue > 0 && (
              <span className="font-medium text-green-600">
                RD${lead.expectedValue.toLocaleString()}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

/**
 * Renders pipeline: on mobile, stage pills + vertical list of leads;
 * on md+, horizontal Kanban columns with drag-and-drop.
 */
export function PipelineBoard({ stages, leadsByStage }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<LeadStage>("new");
  const [leadToView, setLeadToView] = useState<LeadRow | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<LeadRow | null>(null);
  const [activeLead, setActiveLead] = useState<LeadRow | null>(null);
  const leads = leadsByStage[selectedStage] ?? [];
  const stageLabel = stages.find((s) => s.key === selectedStage)?.label ?? selectedStage;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const allLeads = stages.flatMap((s) => leadsByStage[s.key] ?? []);

  const handleDragStart = (event: { active: { id: string } }) => {
    const lead = allLeads.find((l) => l.id === event.active.id) ?? null;
    setActiveLead(lead);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    if (!over || over.id === active.id) return;
    const leadId = active.data.current?.leadId as string | undefined;
    const currentStage = active.data.current?.currentStage as LeadStage | undefined;
    const newStage = over.id as LeadStage;
    const isValidStage = stages.some((s) => s.key === newStage);
    if (!leadId || !currentStage || !isValidStage || newStage === currentStage) return;
    await updateLeadStage(leadId, newStage);
    router.refresh();
  };

  return (
    <div className="min-w-0 flex-1 min-h-0 flex flex-col">
      {/* Mobile: stage selector + vertical list */}
      <div className="md:hidden flex-shrink-0">
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

      {/* Desktop: Kanban fills height; scroll inside each column */}
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
                className="flex-shrink-0 min-w-[260px] w-72 bg-gray-100 rounded-xl flex flex-col h-full min-h-0"
              >
                <div className="p-3 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stage.color}`} />
                    <h3 className="font-semibold text-gray-700 truncate">{t.dashboard.pipeline.stages[stage.key]}</h3>
                    <span className="ml-auto text-sm text-gray-500 flex-shrink-0">
                      {(leadsByStage[stage.key] ?? []).length}
                    </span>
                  </div>
                </div>
                <div className="pipeline-column-scroll flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
                  {(leadsByStage[stage.key] ?? []).map((lead) => (
                    <DraggableLeadCard
                      key={lead.id}
                      lead={lead}
                      onView={() => setLeadToView(lead)}
                    />
                  ))}
                  {(leadsByStage[stage.key] ?? []).length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-8">{t.dashboard.pipeline.noLeads}</p>
                  )}
                </div>
              </DroppableColumn>
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeLead ? (
              <div className="bg-white rounded-xl border-2 border-[#1C6ED5] shadow-xl p-3 w-72 opacity-95 cursor-grabbing">
                <h4 className="font-medium text-gray-900 truncate">{activeLead.name}</h4>
                {activeLead.company && (
                  <p className="text-sm text-gray-500 truncate">{activeLead.company}</p>
                )}
                {activeLead.phone && (
                  <p className="text-xs text-gray-500 truncate">{activeLead.phone}</p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span className={activeLead.source === "other" && activeLead.sourceOther ? "" : "capitalize"}>
                    {sourceDisplay(activeLead.source, activeLead.sourceOther)}
                  </span>
                  {activeLead.expectedValue != null && activeLead.expectedValue > 0 && (
                    <span className="font-medium text-green-600">
                      RD${activeLead.expectedValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {leadToView && (
        <LeadViewModal
          lead={leadToView}
          open={true}
          onClose={() => setLeadToView(null)}
          onEdit={() => {
            setLeadToEdit(leadToView);
            setLeadToView(null);
          }}
          onStageChange={(newStage) => {
            setLeadToView((prev) =>
              prev ? { ...prev, stage: newStage } : null
            );
          }}
        />
      )}
      {leadToEdit && (
        <EditLeadModal
          lead={leadToEdit}
          open={true}
          onClose={() => setLeadToEdit(null)}
        />
      )}
    </div>
  );
}

/**
 * Lead card: compact in Kanban (click opens view modal on desktop), list links to detail page.
 */
function LeadCard({
  lead,
  variant,
  onView,
}: {
  lead: LeadRow;
  variant: "kanban" | "list";
  onView?: () => void;
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
            {lead.phone && (
              <p className="text-sm text-gray-500 truncate mt-0.5">{lead.phone}</p>
            )}
          </div>
          {lead.expectedValue != null && lead.expectedValue > 0 && (
            <span className="flex-shrink-0 text-sm font-semibold text-green-600">
              RD${lead.expectedValue.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span className={lead.source === "other" && lead.sourceOther ? "" : "capitalize"}>
            {sourceDisplay(lead.source, lead.sourceOther)}
          </span>
          <span>{created}</span>
        </div>
      </Link>
    );
  }

  if (onView) {
    return (
      <button
        type="button"
        onClick={onView}
        className="w-full text-left bg-white p-3 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-offset-1"
      >
        <h4 className="font-medium text-gray-900 truncate">{lead.name}</h4>
        {lead.company && (
          <p className="text-sm text-gray-500 truncate">{lead.company}</p>
        )}
        {lead.phone && (
          <p className="text-xs text-gray-500 truncate">{lead.phone}</p>
        )}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={lead.source === "other" && lead.sourceOther ? "text-gray-400" : "text-gray-400 capitalize"}>
            {sourceDisplay(lead.source, lead.sourceOther)}
          </span>
          {lead.expectedValue != null && lead.expectedValue > 0 && (
            <span className="font-medium text-green-600">
              RD${lead.expectedValue.toLocaleString()}
            </span>
          )}
        </div>
      </button>
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
      {lead.phone && (
        <p className="text-xs text-gray-500 truncate">{lead.phone}</p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={lead.source === "other" && lead.sourceOther ? "text-gray-400" : "text-gray-400 capitalize"}>
          {sourceDisplay(lead.source, lead.sourceOther)}
        </span>
        {lead.expectedValue != null && lead.expectedValue > 0 && (
          <span className="font-medium text-green-600">
            RD${lead.expectedValue.toLocaleString()}
          </span>
        )}
      </div>
    </Link>
  );
}
