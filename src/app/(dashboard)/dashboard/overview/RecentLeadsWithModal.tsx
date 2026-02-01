"use client";

/**
 * Recent leads list with LeadViewModal on row click.
 * "Create Lead" opens same NewLeadModal as pipeline; Edit / Convert navigate to pipeline/[id].
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadViewModal } from "../pipeline/LeadViewModal";
import { NewLeadModal } from "../pipeline/NewLeadModal";
import { ListCard, StageBadge } from "./OverviewComponents";
import type { LeadRow } from "../pipeline/PipelineBoard";

export interface RecentLeadsWithModalProps {
  leads: LeadRow[];
  title: string;
  href: string;
  emptyMessage: string;
  viewAllLabel: string;
  primaryAction?: { label: string; href: string };
  stageLabels: Record<string, string>;
}

/**
 * Renders recent leads card; clicking a row opens LeadViewModal (same as pipeline).
 * Edit and Convert actions navigate to pipeline lead page.
 */
export function RecentLeadsWithModal({
  leads,
  title,
  href,
  emptyMessage,
  viewAllLabel,
  primaryAction,
  stageLabels,
}: RecentLeadsWithModalProps) {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);

  const openModal = (lead: LeadRow) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLead(null);
  };

  const goToPipelineLead = (leadId: string) => {
    closeModal();
    router.push(`/dashboard/pipeline/${leadId}`);
  };

  /** When primaryAction is present (Create Lead), render button that opens NewLeadModal instead of link. */
  const primaryActionNode = primaryAction ? (
    <button
      type="button"
      onClick={() => setNewLeadModalOpen(true)}
      className="text-sm font-medium text-[#1C6ED5] hover:underline"
    >
      {primaryAction.label}
    </button>
  ) : undefined;

  if (leads.length === 0) {
    return (
      <>
        <ListCard
          title={title}
          href={href}
          emptyMessage={emptyMessage}
          viewAllLabel={viewAllLabel}
          primaryAction={primaryAction}
          primaryActionNode={primaryActionNode}
          listContainerClassName="space-y-2"
        >
          {null}
        </ListCard>
        <NewLeadModal
          open={newLeadModalOpen}
          onClose={() => setNewLeadModalOpen(false)}
          onSuccess={() => {
            setNewLeadModalOpen(false);
            router.refresh();
          }}
        />
      </>
    );
  }

  return (
    <>
      <ListCard
        title={title}
        href={href}
        emptyMessage={emptyMessage}
        viewAllLabel={viewAllLabel}
        primaryAction={primaryAction}
        primaryActionNode={primaryActionNode}
        listContainerClassName="space-y-2"
      >
        {leads.map((lead) => (
          <button
            key={lead.id}
            type="button"
            onClick={() => openModal(lead)}
            className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-100 bg-slate-50/80 px-4 py-3.5 text-left transition hover:border-[#1C6ED5]/30 hover:bg-[#1C6ED5]/5"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#0B132B] truncate">{lead.name}</p>
              <p className="text-sm text-[#8A8F98] truncate">{lead.company || "—"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StageBadge stage={lead.stage} label={stageLabels[lead.stage]} />
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1C6ED5]/10 text-[#1C6ED5] opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </button>
        ))}
      </ListCard>
      {selectedLead && (
        <LeadViewModal
          lead={selectedLead}
          open={modalOpen}
          onClose={closeModal}
          onEdit={() => goToPipelineLead(selectedLead.id)}
          onStageChange={() => router.refresh()}
          onRequestConvert={() => goToPipelineLead(selectedLead.id)}
        />
      )}
      <NewLeadModal
        open={newLeadModalOpen}
        onClose={() => setNewLeadModalOpen(false)}
        onSuccess={() => {
          setNewLeadModalOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
