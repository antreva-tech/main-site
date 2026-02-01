"use server";

/**
 * Profile Settings Server Actions
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

/**
 * Updates the current user's display name.
 * @param name - New display name (2-100 characters)
 * @returns Success status and optional error message
 */
export async function updateName(name: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  // Validate name
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return { success: false, error: "Name must be at least 2 characters" };
  }
  if (trimmedName.length > 100) {
    return { success: false, error: "Name must be less than 100 characters" };
  }

  try {
    const oldUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true },
    });

    await prisma.user.update({
      where: { id: session.id },
      data: { name: trimmedName },
    });

    // Audit log
    await logAction({
      userId: session.id,
      action: "update",
      entityType: "user",
      entityId: session.id,
      metadata: {
        before: { name: oldUser?.name },
        after: { name: trimmedName },
      },
    });

    revalidatePath("/dashboard/settings/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to update name:", error);
    return { success: false, error: "Failed to update name" };
  }
}
