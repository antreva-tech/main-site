/**
 * Role Management Page (CEO/CTO only via roles.manage).
 * Edit role name and permissions.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRole } from "./actions";
import { AVAILABLE_PERMISSIONS } from "./permissions";
import { RoleManagementTable } from "./RoleManagementTable";

export default async function RolesPage() {
  const session = await getSession();
  if (!session?.permissions.includes("roles.manage")) {
    redirect("/dashboard");
  }

  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });

  const rolesSerialized = roles.map((r) => ({
    id: r.id,
    name: r.name,
    permissions: (r.permissions as string[]) ?? [],
    userCount: r._count.users,
  }));

  return (
    <div>
      <Link
        href="/dashboard/settings/users"
        className="inline-flex items-center gap-1.5 text-sm text-[#1C6ED5] hover:text-[#0B132B] mb-4"
      >
        <span aria-hidden>←</span>
        User Management
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Role Management</h1>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Edit role names and permissions. Only CEO and CTO can access this section.
      </p>
      <RoleManagementTable
        roles={rolesSerialized}
        permissionOptions={AVAILABLE_PERMISSIONS}
        updateRoleAction={updateRole}
      />
    </div>
  );
}
