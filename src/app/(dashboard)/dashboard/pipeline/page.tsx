/**
 * Pipeline Page
 * Server component: fetches leads, passes serialized data to PipelinePageView (client).
 */

import { prisma } from "@/lib/prisma";
import { LeadStage } from "@prisma/client";
import { PipelinePageView } from "./PipelinePageView";
import type { LeadRow, StageConfig } from "./PipelineBoard";

/** Pipeline stages in order. */
const STAGES: StageConfig[] = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "qualified", label: "Qualified", color: "bg-cyan-500" },
  { key: "proposal", label: "Proposal", color: "bg-purple-500" },
  { key: "negotiation", label: "Negotiation", color: "bg-yellow-500" },
  { key: "won", label: "Won", color: "bg-green-500" },
  { key: "lost", label: "Lost", color: "bg-gray-400" },
];

/**
 * Pipeline page: fetches leads, renders client view with translated header and board.
 */
export default async function PipelinePage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      stage: true,
      expectedValue: true,
      source: true,
      createdAt: true,
    },
  });

  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    company: l.company,
    email: l.email,
    stage: l.stage,
    expectedValue: l.expectedValue != null ? Number(l.expectedValue) : null,
    source: l.source,
    createdAt: l.createdAt.toISOString(),
  }));

  const leadsByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage.key] = rows.filter((r) => r.stage === stage.key);
      return acc;
    },
    {} as Record<LeadStage, LeadRow[]>
  );

  return (
    <PipelinePageView stages={STAGES} leadsByStage={leadsByStage} />
  );
}
