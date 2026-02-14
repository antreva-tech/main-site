/**
 * Server Actions for Development Pipeline (CTO-only create/update/log).
 * Sales team can see project stage on client page via normal client fetch.
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logCreate, logUpdate, logDelete } from "@/lib/audit";
import type { DevelopmentStage } from "@/generated/prisma/client";

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
 * Returns true if user is CTO or Developer (by title or roleName).
 */
function isDeveloperOrCTO(session: { title: string | null; roleName?: string }) {
  return (
    session.title === "CTO" ||
    session.title === "Developer" ||
    session.roleName?.toLowerCase() === "developer"
  );
}

/**
 * Throws if user is not CTO or Developer.
 */
function requireDevOrCTO(session: { title: string | null; roleName?: string }) {
  if (!isDeveloperOrCTO(session)) {
    throw new Error("Only the CTO or developers can perform this action.");
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
 * Updates a development project's stage and optionally notes.
 * Developer: can only change stage.
 * CTO: can change stage + notes.
 */
export async function updateDevelopmentProject(
  projectId: string,
  formData: FormData
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireDevOrCTO(session);

  const project = await prisma.developmentProject.findUnique({
    where: { id: projectId },
    include: { client: true },
  });
  if (!project) throw new Error("Project not found");

  const isCTO = session.title === "CTO";

  const stageRaw = formData.get("stage") as string | null;
  const stage: DevelopmentStage | undefined =
    stageRaw && DEV_STAGES.includes(stageRaw as DevelopmentStage)
      ? (stageRaw as DevelopmentStage)
      : undefined;

  const data: { stage?: DevelopmentStage; notes?: string | null } = {};
  if (stage != null) data.stage = stage;

  // Only CTO can update notes
  if (isCTO) {
    const notes = (formData.get("notes") as string) || null;
    if (notes !== undefined) data.notes = notes || null;
  }

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
 * Updates only the project stage (e.g. from board). CTO or Developer.
 */
export async function updateDevelopmentProjectStage(
  projectId: string,
  stage: DevelopmentStage
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireDevOrCTO(session);

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
 * Adds a log entry to a development project. CTO or Developer.
 */
export async function addDevelopmentProjectLog(projectId: string, content: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireDevOrCTO(session);

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

/** Intake snapshot field keys editable on a DevelopmentProject. */
const INTAKE_TEXT_FIELDS = [
  "intakeBusinessName",
  "intakePhoneNumber",
  "intakeAddressToUse",
  "intakeDomain",
  "intakeLineOfBusiness",
  "intakePaymentHandling",
  "intakeBusinessDescription",
  "intakeServiceOutcome",
  "intakeAdminEaseNotes",
] as const;

/**
 * Updates the intake snapshot fields on a development project. CTO only.
 * Allows filling in missing intake data or correcting values.
 */
export async function updateIntakeSnapshot(
  projectId: string,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  requireCTO(session);

  const project = await prisma.developmentProject.findUnique({
    where: { id: projectId },
  });
  if (!project) return { error: "Project not found" };

  const data: Record<string, string | boolean | null> = {};

  for (const key of INTAKE_TEXT_FIELDS) {
    const raw = formData.get(key) as string | null;
    if (raw !== null) {
      data[key] = raw.trim() || null;
    }
  }

  // Boolean fields
  data.intakeHasDomain = formData.get("intakeHasDomain") === "true";
  data.intakeWhatsappEnabled = formData.get("intakeWhatsappEnabled") === "true";

  await prisma.developmentProject.update({
    where: { id: projectId },
    data,
  });

  await logUpdate(session.id, "development_project", projectId, { intake: "before" }, { intake: "updated" });

  revalidatePath(`/dashboard/development/${projectId}`);
  return undefined;
}
