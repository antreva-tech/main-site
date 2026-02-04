"use server";

/**
 * Profile Settings Server Actions
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword, validatePasswordComplexity } from "@/lib/auth";
import { logAction } from "@/lib/audit";

/** Return type for changePassword when used with useActionState. */
export type ChangePasswordState = { error?: string } | null;

/**
 * Changes the current user's password. Expects formData: currentPassword, newPassword, confirmPassword.
 * Enforces password complexity (min length, upper, lower, number, special char).
 */
export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const currentPassword = (formData.get("currentPassword") as string)?.trim() ?? "";
  const newPassword = (formData.get("newPassword") as string)?.trim() ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim() ?? "";

  if (!currentPassword) return { error: "Current password is required" };
  if (!newPassword) return { error: "New password is required" };

  const complexity = validatePasswordComplexity(newPassword);
  if (!complexity.valid) return { error: complexity.error };
  if (newPassword !== confirmPassword) return { error: "Passwords do not match" };

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { passwordHash: true } });
  if (!user) return { error: "User not found" };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect" };

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  await logAction({
    userId: session.id,
    action: "update",
    entityType: "user",
    entityId: session.id,
    metadata: { context: { message: "Password changed" } },
  });

  revalidatePath("/dashboard/settings/profile");
  return null;
}

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

/**
 * Updates the current user's preferred dashboard language.
 * @param locale - "es" | "en"
 * @returns Success status and optional error message
 */
export async function updatePreferredLocale(
  locale: "es" | "en"
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await prisma.user.update({
      where: { id: session.id },
      data: { preferredLocale: locale },
    });

    await logAction({
      userId: session.id,
      action: "update",
      entityType: "user",
      entityId: session.id,
      metadata: { preferredLocale: locale },
    });

    revalidatePath("/dashboard/settings/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to update preferred locale:", error);
    return { success: false, error: "Failed to update language preference" };
  }
}
