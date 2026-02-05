"use server";

/**
 * Server actions for Demo Sites.
 * List: all authenticated users. Create/update/delete: users.manage only.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

function requireManage(session: { permissions: string[] } | null) {
  if (!session?.permissions.includes("users.manage")) {
    throw new Error("Only users with manage permission can add or edit demo sites.");
  }
}

/**
 * Creates a demo site. Expects formData: name, url, description (optional), sortOrder (optional).
 */
export async function createDemoSite(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  requireManage(session);

  const name = (formData.get("name") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  if (!name || !url) throw new Error("Name and website URL are required");

  const adminPortalUrl = (formData.get("adminPortalUrl") as string)?.trim() || null;
  const demoLoginUsername = (formData.get("demoLoginUsername") as string)?.trim() || null;
  const demoLoginPassword = (formData.get("demoLoginPassword") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const sortOrderRaw = formData.get("sortOrder");
  const sortOrder = sortOrderRaw !== null && sortOrderRaw !== "" ? Number(sortOrderRaw) : 0;

  const demo = await prisma.demoSite.create({
    data: { name, url, adminPortalUrl, demoLoginUsername, demoLoginPassword, description, sortOrder },
  });

  await logAction({
    userId: session.id,
    action: "create",
    entityType: "demo_site",
    entityId: demo.id,
    metadata: { after: { name, url } },
  });

  revalidatePath("/dashboard/demos");
  return { success: true };
}

/**
 * Updates a demo site. Expects formData: id, name, url, description (optional), sortOrder (optional).
 */
export async function updateDemoSite(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  requireManage(session);

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  if (!id || !name || !url) throw new Error("ID, name and website URL are required");

  const adminPortalUrl = (formData.get("adminPortalUrl") as string)?.trim() || null;
  const demoLoginUsername = (formData.get("demoLoginUsername") as string)?.trim() || null;
  const demoLoginPassword = (formData.get("demoLoginPassword") as string)?.trim() || null;

  await prisma.demoSite.update({
    where: { id },
    data: {
      name,
      url,
      adminPortalUrl,
      demoLoginUsername,
      demoLoginPassword,
      description: (formData.get("description") as string)?.trim() || null,
      sortOrder: (() => {
        const raw = formData.get("sortOrder");
        return raw !== null && raw !== "" ? Number(raw) : 0;
      })(),
    },
  });

  await logAction({
    userId: session.id,
    action: "update",
    entityType: "demo_site",
    entityId: id,
    metadata: { after: { name, url } },
  });

  revalidatePath("/dashboard/demos");
  return { success: true };
}

/**
 * Deletes a demo site. Expects formData: id.
 */
export async function deleteDemoSite(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  requireManage(session);

  const id = formData.get("id") as string;
  if (!id) throw new Error("ID is required");

  await prisma.demoSite.delete({ where: { id } });

  await logAction({
    userId: session.id,
    action: "delete",
    entityType: "demo_site",
    entityId: id,
  });

  revalidatePath("/dashboard/demos");
  return { success: true };
}
