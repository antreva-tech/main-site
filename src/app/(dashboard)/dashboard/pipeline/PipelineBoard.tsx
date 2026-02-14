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
  type DragStartEvent,
} from "@dnd-kit/core";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LeadStage } from "@/generated/prisma/client";
import { EditLeadModal } from "./EditLeadModal";
import { LeadViewModal } from "./LeadViewModal";
import { ConvertToClientModal } from "./ConvertToClientModal";
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
  /** Who referred (when source is referral); for referral payment tracking. */
  referralFrom: string | null;
  /** Line of business / industry. */
  lineOfBusiness: string | null;
  notes: string | null;
  lostReason: string | null;
  expectedValue: number | null;
  createdAt: string;
  /** Set when lead is won and converted to client; used to lock stage and show View client. */
  convertedClientId: string | null;
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

/** Draggable lead card with handle; click (non-handle) opens view modal. Won leads are not draggable. */
function DraggableLeadCard({
  lead,
  onView,
}: {
  lead: LeadRow;
  onView: () => void;
}) {
  const isWon = lead.stage === "won";
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { leadId: lead.id, currentStage: lead.stage },
    disabled: isWon,
  });
  return (
    <div
      ref={setNodeRef}
      className={`bg-white dark:bg-gray-800/95 rounded-xl border border-gray-200 dark:border-gray-500/70 overflow-hidden shadow-sm dark:shadow-md dark:shadow-black/25 ${isDragging ? "opacity-50 shadow-lg" : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-400 dark:hover:shadow-lg dark:hover:shadow-black/30"} transition`}
    >
      <div className="flex">
        {!isWon && (
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
        )}
        <button
          type="button"
          onClick={onView}
          className={`flex-1 min-w-0 text-left p-3 pr-2 focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-inset rounded-r-xl ${isWon ? "rounded-l-xl" : ""}`}
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{lead.name}</h4>
          {lead.company && (
            <p className="text-sm text-gray-500 dark:text-gray-300 truncate">{lead.company}</p>
          )}
          {lead.phone && (
            <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{lead.phone}</p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={lead.source === "other" && lead.sourceOther ? "text-gray-400 dark:text-gray-400" : "text-gray-400 dark:text-gray-400 capitalize"}>
              {sourceDisplay(lead.source, lead.sourceOther)}
            </span>
            {lead.expectedValue != null && lead.expectedValue > 0 && (
              <span className="font-medium text-green-600 dark:text-green-400">
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
  const [leadToConvert, setLeadToConvert] = useState<LeadRow | null>(null);
  const [activeLead, setActiveLead] = useState<LeadRow | null>(null);
  const leads = leadsByStage[selectedStage] ?? [];
  const stageLabel = stages.find((s) => s.key === selectedStage)?.label ?? selectedStage;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const allLeads = stages.flatMap((s) => leadsByStage[s.key] ?? []);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id;
    const lead =
      typeof id === "string" ? allLeads.find((l) => l.id === id) ?? null : null;
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
    // Won is final: cannot move a won lead.
    if (currentStage === "won") return;
    // Moving to Won: open convert modal instead of updating stage.
    if (newStage === "won") {
      const lead = allLeads.find((l) => l.id === leadId) ?? null;
      if (lead) setLeadToConvert(lead);
      return;
    }
    await updateLeadStage(leadId, newStage);
    router.refresh();
  };

  return (
    <div className="min-w-0 flex-1 min-h-0 flex flex-col">
      {/* Mobile: stage selector + scrollable vertical list (flex-1 min-h-0 so list can overflow-y-auto). */}
      <div className="md:hidden flex flex-col flex-1 min-h-0">
        {/* Stage pills - horizontal scroll with snap */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-none flex-shrink-0">
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
                    ? "bg-[#0B132B] dark:bg-gray-700 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-[#1C6ED5]/40 dark:hover:border-[#1C6ED5]/50 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stage.color}`} />
                <span>{t.dashboard.pipeline.stages[stage.key]}</span>
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

        {/* Lead list for selected stage - scrollable on mobile so list is not clipped. */}
        <div className="mt-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-3 pb-4">
          {leads.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600 px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t.dashboard.pipeline.noLeadsInStage} {stageLabel}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t.dashboard.pipeline.addLeadOrSwitch}</p>
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
                className="flex-shrink-0 min-w-[260px] w-72 bg-gray-100 dark:bg-gray-800/80 rounded-xl flex flex-col h-full min-h-0"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stage.color}`} />
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 truncate">{t.dashboard.pipeline.stages[stage.key]}</h3>
                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
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
                    <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">{t.dashboard.pipeline.noLeads}</p>
                  )}
                </div>
              </DroppableColumn>
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeLead ? (
              <div className="bg-white dark:bg-gray-800/95 rounded-xl border-2 border-[#1C6ED5] shadow-xl dark:shadow-2xl dark:shadow-black/40 p-3 w-72 opacity-95 cursor-grabbing">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{activeLead.name}</h4>
                {activeLead.company && (
                  <p className="text-sm text-gray-500 dark:text-gray-300 truncate">{activeLead.company}</p>
                )}
                {activeLead.phone && (
                  <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{activeLead.phone}</p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-400">
                  <span className={activeLead.source === "other" && activeLead.sourceOther ? "" : "capitalize"}>
                    {sourceDisplay(activeLead.source, activeLead.sourceOther)}
                  </span>
                  {activeLead.expectedValue != null && activeLead.expectedValue > 0 && (
                    <span className="font-medium text-green-600 dark:text-green-400">
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
          onRequestConvert={(lead) => {
            setLeadToView(null);
            setLeadToConvert(lead);
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
      {leadToConvert && (
        <ConvertToClientModal
          open={true}
          onClose={() => setLeadToConvert(null)}
          leadId={leadToConvert.id}
          leadName={leadToConvert.name}
          leadEmail={leadToConvert.email}
          onSuccess={() => setLeadToConvert(null)}
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
        className="block bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-200 dark:border-gray-500/70 p-4 active:bg-gray-50 dark:active:bg-gray-700 transition shadow-sm dark:shadow-md dark:shadow-black/25 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-400 dark:hover:shadow-lg dark:hover:shadow-black/30 min-h-[88px]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{lead.name}</p>
            {lead.company && (
              <p className="text-sm text-gray-500 dark:text-gray-300 truncate mt-0.5">{lead.company}</p>
            )}
            {lead.phone && (
              <p className="text-sm text-gray-500 dark:text-gray-300 truncate mt-0.5">{lead.phone}</p>
            )}
          </div>
          {lead.expectedValue != null && lead.expectedValue > 0 && (
            <span className="flex-shrink-0 text-sm font-semibold text-green-600 dark:text-green-400">
              RD${lead.expectedValue.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
        className="w-full text-left bg-white dark:bg-gray-800/95 p-3 rounded-xl border border-gray-200 dark:border-gray-500/70 shadow-sm dark:shadow-md dark:shadow-black/25 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-offset-1 dark:focus:ring-offset-gray-800"
      >
        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{lead.name}</h4>
        {lead.company && (
          <p className="text-sm text-gray-500 dark:text-gray-300 truncate">{lead.company}</p>
        )}
        {lead.phone && (
          <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{lead.phone}</p>
        )}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={lead.source === "other" && lead.sourceOther ? "text-gray-400 dark:text-gray-400" : "text-gray-400 dark:text-gray-400 capitalize"}>
            {sourceDisplay(lead.source, lead.sourceOther)}
          </span>
          {lead.expectedValue != null && lead.expectedValue > 0 && (
            <span className="font-medium text-green-600 dark:text-green-400">
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
      className="block bg-white dark:bg-gray-800/95 p-3 rounded-xl border border-gray-200 dark:border-gray-500/70 shadow-sm dark:shadow-md dark:shadow-black/25 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-400 transition"
    >
      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{lead.name}</h4>
      {lead.company && (
        <p className="text-sm text-gray-500 dark:text-gray-300 truncate">{lead.company}</p>
      )}
      {lead.phone && (
        <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{lead.phone}</p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={lead.source === "other" && lead.sourceOther ? "text-gray-400 dark:text-gray-400" : "text-gray-400 dark:text-gray-400 capitalize"}>
          {sourceDisplay(lead.source, lead.sourceOther)}
        </span>
        {lead.expectedValue != null && lead.expectedValue > 0 && (
          <span className="font-medium text-green-600 dark:text-green-400">
            RD${lead.expectedValue.toLocaleString()}
          </span>
        )}
      </div>
    </Link>
  );
}
