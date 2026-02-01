/**
 * Server Actions for Development Pipeline (CTO-only create/update/log).
 * Sales team can see project stage on client page via normal client fetch.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logCreate, logUpdate, logDelete } from "@/lib/audit";
import type { DevelopmentStage } from "@prisma/client";

/** Valid development stages. */
const DEV_STAGES: DevelopmentStage[] = [
  "discovery",
  "design",
  "development",
  "qa",
  "deployment",
  "completed",
  "on_hold",
];

/**
 * Throws if current user is not CTO (by title).
 */
function requireCTO(session: { title: string | null }) {
  if (session.title !== "CTO") {
    throw new Error("Only the CTO can manage the development pipeline.");
  }
}

/**
 * Creates a development project for a client. CTO only.
 */
export async function createDevelopmentProject(clientId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireCTO(session);

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error("Client not found");

  const existing = await prisma.developmentProject.findUnique({
    where: { clientId },
  });
  if (existing) throw new Error("This client already has a development project.");

  const project = await prisma.developmentProject.create({
    data: {
      clientId,
      stage: "discovery",
    },
  });

  await logCreate(session.id, "development_project", project.id, {
    clientId,
    stage: "discovery",
  });

  revalidatePath("/dashboard/development");
  revalidatePath(`/dashboard/development/${project.id}`);
  revalidatePath(`/dashboard/clients/${clientId}`);
  return project;
}

/**
 * Updates a development project's stage and/or notes. CTO only.
 */
export async function updateDevelopmentProject(
  projectId: string,
  formData: FormData
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireCTO(session);

  const project = await prisma.developmentProject.findUnique({
    where: { id: projectId },
    include: { client: true },
  });
  if (!project) throw new Error("Project not found");

  const stageRaw = formData.get("stage") as string | null;
  const stage: DevelopmentStage | undefined =
    stageRaw && DEV_STAGES.includes(stageRaw as DevelopmentStage)
      ? (stageRaw as DevelopmentStage)
      : undefined;
  const notes = (formData.get("notes") as string) || null;

  const data: { stage?: DevelopmentStage; notes?: string | null } = {};
  if (stage != null) data.stage = stage;
  if (notes !== undefined) data.notes = notes || null;

  const updated = await prisma.developmentProject.update({
    where: { id: projectId },
    data,
  });

  await logUpdate(
    session.id,
    "development_project",
    projectId,
    { stage: project.stage, notes: project.notes },
    data
  );

  revalidatePath("/dashboard/development");
  revalidatePath(`/dashboard/development/${projectId}`);
  revalidatePath(`/dashboard/clients/${project.clientId}`);
  return updated;
}

/**
 * Updates only the project stage (e.g. from board). CTO only.
 */
export async function updateDevelopmentProjectStage(
  projectId: string,
  stage: DevelopmentStage
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireCTO(session);

  if (!DEV_STAGES.includes(stage)) throw new Error("Invalid stage");

  const project = await prisma.developmentProject.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new Error("Project not found");

  const updated = await prisma.developmentProject.update({
    where: { id: projectId },
    data: { stage },
  });

  await logUpdate(
    session.id,
    "development_project",
    projectId,
    { stage: project.stage },
    { stage }
  );

  revalidatePath("/dashboard/development");
  revalidatePath(`/dashboard/development/${projectId}`);
  revalidatePath(`/dashboard/clients/${project.clientId}`);
  return updated;
}

/**
 * Adds a log entry to a development project. CTO only.
 */
export async function addDevelopmentProjectLog(projectId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireCTO(session);

  const project = await prisma.developmentProject.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new Error("Project not found");

  const trimmed = content?.trim();
  if (!trimmed) throw new Error("Log content is required.");

  const logEntry = await prisma.developmentProjectLog.create({
    data: {
      projectId,
      content: trimmed,
      createdById: session.id,
    },
  });

  await logCreate(session.id, "development_project_log", logEntry.id, {
    projectId,
    contentLength: trimmed.length,
  });

  revalidatePath(`/dashboard/development/${projectId}`);
  return logEntry;
}

/**
 * Deletes a development project (removes project and logs). CTO only.
 */
export async function deleteDevelopmentProject(projectId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireCTO(session);

  const project = await prisma.developmentProject.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new Error("Project not found");

  const clientId = project.clientId;
  await prisma.developmentProject.delete({ where: { id: projectId } });

  await logDelete(session.id, "development_project", projectId, {
    clientId,
    stage: project.stage,
  });

  revalidatePath("/dashboard/development");
  revalidatePath(`/dashboard/clients/${clientId}`);
}
