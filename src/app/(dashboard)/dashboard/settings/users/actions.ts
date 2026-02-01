/**
 * Server Actions for User Management (CEO/CTO and users.manage only).
 * Edit user (name, email, title, role, status) and reset password.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

const VALID_STATUSES = ["active", "suspended", "deactivated"] as const;

/**
 * Updates a user. Expects formData: userId, name, email, title, roleId, status.
 * Requires users.manage.
 */
export async function updateUser(formData: FormData) {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    throw new Error("Unauthorized");
  }

  const userId = formData.get("userId") as string;
  if (!userId) throw new Error("User ID required");

  const target = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!target) throw new Error("User not found");

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const title = (formData.get("title") as string)?.trim() || null;
  const roleId = formData.get("roleId") as string;
  const statusRaw = formData.get("status") as string;

  if (!name || !email) throw new Error("Name and email are required");
  if (!roleId) throw new Error("Role is required");
  const status = VALID_STATUSES.includes(statusRaw as (typeof VALID_STATUSES)[number])
    ? (statusRaw as (typeof VALID_STATUSES)[number])
    : target.status;

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Role not found");

  if (email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already in use");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name, email, title, roleId, status },
  });

  revalidatePath("/dashboard/settings/users");
  redirect("/dashboard/settings/users");
}

/**
 * Resets a user's password (admin-set new password). Expects formData: userId, newPassword, confirmPassword.
 * Requires users.manage.
 */
export async function resetUserPassword(formData: FormData) {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    throw new Error("Unauthorized");
  }

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!userId) throw new Error("User ID required");
  if (!newPassword || newPassword.length < 12) {
    throw new Error("Password must be at least 12 characters");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  revalidatePath("/dashboard/settings/users");
  redirect("/dashboard/settings/users");
}
