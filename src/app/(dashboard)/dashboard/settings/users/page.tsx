/**
 * User Management Page (Admin Only)
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Users management page.
 */
export default async function UsersPage() {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      role: { select: { name: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
        <button className="w-full sm:w-auto px-4 py-2.5 bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition text-center">
          + Invite User
        </button>
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                MFA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.title && (
                    <span className="text-xs text-gray-400">{user.title}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">
                    {user.role.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.lastLoginAt?.toLocaleDateString() || "Never"}
                </td>
                <td className="px-6 py-4">
                  {user.mfaSecret ? (
                    <span className="text-green-600 text-sm">Enabled</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Disabled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-500">
            No users found
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  {user.title && (
                    <p className="text-xs text-gray-400 mt-0.5">{user.title}</p>
                  )}
                </div>
                <StatusBadge status={user.status} />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                  {user.role.name}
                </span>
                <span className="text-gray-500">
                  {user.lastLoginAt ? `Last login: ${user.lastLoginAt.toLocaleDateString()}` : "Never logged in"}
                </span>
                {user.mfaSecret ? (
                  <span className="text-green-600">MFA On</span>
                ) : (
                  <span className="text-gray-400">MFA Off</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    suspended: "bg-yellow-100 text-yellow-700",
    deactivated: "bg-gray-100 text-gray-500",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
