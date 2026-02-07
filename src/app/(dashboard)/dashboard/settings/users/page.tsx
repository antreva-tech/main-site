/**
 * User Management Page (CEO/CTO and users.manage only)
 * Edit users (name, email, title, role, status) and reset passwords.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateUser, resetUserPassword } from "./actions";
import { InviteUserButton } from "./InviteUserButton";
import { UserManagementTable } from "./UserManagementTable";

/**
 * Users management page.
 */
export default async function UsersPage() {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    redirect("/dashboard");
  }

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        role: { select: { id: true, name: true } },
      },
    }),
    prisma.role.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const usersSerialized = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    title: u.title,
    status: u.status,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    mfaSecret: u.mfaSecret,
    role: u.role,
  }));

  const rolesSerialized = roles.map((r) => ({ id: r.id, name: r.name }));

  const canManageRoles = session.permissions.includes("roles.manage");

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B132B] dark:text-gray-100 tracking-tight">
          User Management
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          {canManageRoles && (
            <Link
              href="/dashboard/settings/roles"
              className="w-full sm:w-auto px-4 py-2.5 border border-[#0B132B]/20 text-[#0B132B] rounded-lg hover:bg-[#0B132B]/5 transition text-center font-medium inline-block"
            >
              Manage roles
            </Link>
          )}
          <InviteUserButton roles={rolesSerialized} />
        </div>
      </div>

      <UserManagementTable
        users={usersSerialized}
        roles={rolesSerialized}
        updateUser={updateUser}
        resetUserPassword={resetUserPassword}
      />
    </div>
  );
}
