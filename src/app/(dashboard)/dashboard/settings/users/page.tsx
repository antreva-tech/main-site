/**
 * User Management Page (CEO/CTO and users.manage only)
 * Edit users (name, email, title, role, status) and reset passwords.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateUser, resetUserPassword } from "./actions";
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

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
        <button className="w-full sm:w-auto px-4 py-2.5 bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition text-center">
          + Invite User
        </button>
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
