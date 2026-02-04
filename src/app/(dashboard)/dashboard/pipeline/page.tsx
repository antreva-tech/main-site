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
      phone: true,
      stage: true,
      source: true,
      sourceOther: true,
      referralFrom: true,
      notes: true,
      lostReason: true,
      expectedValue: true,
      createdAt: true,
      convertedClientId: true,
    },
  });

  const rows: LeadRow[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    company: l.company,
    email: l.email,
    phone: l.phone,
    stage: l.stage,
    source: l.source,
    sourceOther: l.sourceOther,
    referralFrom: l.referralFrom,
    notes: l.notes,
    lostReason: l.lostReason,
    expectedValue: l.expectedValue != null ? Number(l.expectedValue) : null,
    createdAt: l.createdAt.toISOString(),
    convertedClientId: l.convertedClientId,
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
