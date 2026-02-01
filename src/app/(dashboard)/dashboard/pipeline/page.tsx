/**
 * Pipeline Kanban Board
 * Displays leads organized by stage.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStage } from "@prisma/client";
import { NewLeadButton } from "./NewLeadButton";

/** Pipeline stages in order */
const STAGES: { key: LeadStage; label: string; color: string }[] = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "qualified", label: "Qualified", color: "bg-cyan-500" },
  { key: "proposal", label: "Proposal", color: "bg-purple-500" },
  { key: "negotiation", label: "Negotiation", color: "bg-yellow-500" },
  { key: "won", label: "Won", color: "bg-green-500" },
  { key: "lost", label: "Lost", color: "bg-gray-400" },
];

/**
 * Pipeline page with Kanban-style board.
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

  // Group leads by stage
  const leadsByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage.key] = leads.filter((l) => l.stage === stage.key);
      return acc;
    },
    {} as Record<LeadStage, typeof leads>
  );

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Sales Pipeline</h1>
        <NewLeadButton />
      </div>

      {/* Kanban Board: scrolls horizontally within content area */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 min-h-0 -mx-1 px-1" style={{ scrollbarGutter: "stable" }}>
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className="flex-shrink-0 min-w-[260px] w-72 bg-gray-100 rounded-lg"
          >
            {/* Column Header */}
            <div className="p-2 sm:p-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stage.color}`} />
                <h3 className="font-semibold text-gray-700 text-sm sm:text-base truncate">{stage.label}</h3>
                <span className="ml-auto text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  {leadsByStage[stage.key].length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[320px] sm:min-h-[400px]">
              {leadsByStage[stage.key].map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
              {leadsByStage[stage.key].length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  No leads
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Lead card component.
 */
function LeadCard({
  lead,
}: {
  lead: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    expectedValue: unknown;
    source: string;
    createdAt: Date;
  };
}) {
  const value = lead.expectedValue as number | null;

  return (
    <Link
      href={`/dashboard/pipeline/${lead.id}`}
      className="block bg-white p-2 sm:p-3 rounded-lg border border-gray-200 hover:shadow-md transition"
    >
      <h4 className="font-medium text-gray-900 truncate">{lead.name}</h4>
      {lead.company && (
        <p className="text-sm text-gray-500 truncate">{lead.company}</p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-gray-400 capitalize">{lead.source.replace("_", " ")}</span>
        {value && (
          <span className="font-medium text-green-600">
            RD${value.toLocaleString()}
          </span>
        )}
      </div>
    </Link>
  );
}
