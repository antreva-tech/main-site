/**
 * Development Pipeline Page (CTO only).
 * Board view of development projects by stage.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DevelopmentStage } from "@prisma/client";
import { DevelopmentBoard } from "./DevelopmentBoard";

/** Stage config for columns (label + color). */
const STAGES: { key: DevelopmentStage; label: string; color: string }[] = [
  { key: "discovery", label: "Discovery", color: "bg-blue-500" },
  { key: "design", label: "Design", color: "bg-cyan-500" },
  { key: "development", label: "Development", color: "bg-purple-500" },
  { key: "qa", label: "QA", color: "bg-yellow-500" },
  { key: "deployment", label: "Deployment", color: "bg-orange-500" },
  { key: "completed", label: "Completed", color: "bg-green-500" },
  { key: "on_hold", label: "On Hold", color: "bg-gray-400" },
];

/** Single activity log entry for display in modal (most recent 3). */
export type ProjectLogEntry = {
  id: string;
  content: string;
  createdAt: string;
  createdByName: string;
};

export type ProjectRow = {
  id: string;
  clientId: string;
  clientName: string;
  company: string | null;
  stage: DevelopmentStage;
  notes: string | null;
  updatedAt: string;
  /** Server-formatted date for display (avoids hydration mismatch). */
  updatedAtDisplay: string;
  recentLogs: ProjectLogEntry[];
};

/**
 * Development pipeline: CTO only. Redirects non-CTO to dashboard.
 */
export default async function DevelopmentPipelinePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.title !== "CTO") redirect("/dashboard");

  const projects = await prisma.developmentProject.findMany({
    include: {
      client: {
        select: {
          id: true,
          name: true,
          company: true,
        },
      },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          createdBy: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows: ProjectRow[] = projects.map((p) => ({
    id: p.id,
    clientId: p.client.id,
    clientName: p.client.name,
    company: p.client.company,
    stage: p.stage,
    notes: p.notes,
    updatedAt: p.updatedAt.toISOString(),
    updatedAtDisplay: p.updatedAt.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }),
    recentLogs: p.logs.map((log) => ({
      id: log.id,
      content: log.content,
      createdAt: log.createdAt.toISOString(),
      createdByName: log.createdBy.name,
    })),
  }));

  const projectsByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage.key] = rows.filter((r) => r.stage === stage.key);
      return acc;
    },
    {} as Record<DevelopmentStage, ProjectRow[]>
  );

  return (
    <div className="min-w-0 flex flex-col flex-1 min-h-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
          Development Pipeline
        </h1>
        <Link
          href="/dashboard/clients"
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm text-center text-gray-700 dark:text-gray-200"
        >
          Start project (from Clients)
        </Link>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DevelopmentBoard stages={STAGES} projectsByStage={projectsByStage} />
      </div>
    </div>
  );
}
