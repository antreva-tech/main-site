/**
 * Development Project Detail Page (CTO only).
 * Stage selector, notes, and activity log.
 */

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectStageForm } from "./ProjectStageForm";
import { ProjectLogForm } from "./ProjectLogForm";

/**
 * Project detail: CTO only. Shows stage, notes, and log entries.
 */
export default async function DevelopmentProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.title !== "CTO") redirect("/dashboard");

  const { id } = await params;

  const project = await prisma.developmentProject.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          company: true,
          email: true,
        },
      },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          createdBy: { select: { name: true } },
        },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link
          href="/dashboard/development"
          className="text-[#1C6ED5] hover:underline text-sm"
        >
          ← Back to Development Pipeline
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6 mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {project.client.company || project.client.name}
        </h1>
        {project.client.company && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.client.name}</p>
        )}
        <Link
          href={`/dashboard/clients/${project.client.id}`}
          className="text-sm text-[#1C6ED5] hover:underline mt-2 inline-block"
        >
          View client →
        </Link>

        <div className="mt-6">
          <ProjectStageForm
            projectId={project.id}
            currentStage={project.stage}
            currentNotes={project.notes ?? ""}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Activity log
        </h2>
        <ProjectLogForm projectId={project.id} />

        <ul className="mt-6 space-y-3">
          {project.logs.length === 0 ? (
            <li className="text-sm text-gray-500 dark:text-gray-400 py-4">No log entries yet.</li>
          ) : (
            project.logs.map((log) => (
              <li
                key={log.id}
                className="p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg border border-gray-100 dark:border-gray-600"
              >
                <p className="text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap">
                  {log.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {log.createdBy.name} ·{" "}
                  {log.createdAt.toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
