/**
 * Server Actions for Role Management (CEO/CTO only via roles.manage).
 * Edit role name and permissions.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AVAILABLE_PERMISSIONS } from "./permissions";

/**
 * Updates a role. Expects formData: roleId, name (optional), and permission checkboxes (permission_<value>).
 * Requires roles.manage.
 */
export async function updateRole(formData: FormData) {
  const session = await getSession();
  if (!session?.permissions.includes("roles.manage")) {
    throw new Error("Unauthorized");
  }

  const roleId = formData.get("roleId") as string;
  if (!roleId) throw new Error("Role ID required");

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Role not found");

  const nameRaw = (formData.get("name") as string)?.trim();
  const name = nameRaw ? nameRaw.toLowerCase() : null;
  if (name) {
    const existing = await prisma.role.findFirst({
      where: { name, id: { not: roleId } },
    });
    if (existing) throw new Error("A role with this name already exists");
  }

  const permissions: string[] = [];
  for (const { value } of AVAILABLE_PERMISSIONS) {
    if (formData.get(`permission_${value}`) === "on") {
      permissions.push(value);
    }
  }

  await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(name ? { name } : {}),
      permissions,
    },
  });

  revalidatePath("/dashboard/settings/roles");
  revalidatePath("/dashboard/settings/users");
  redirect("/dashboard/settings/roles");
}
