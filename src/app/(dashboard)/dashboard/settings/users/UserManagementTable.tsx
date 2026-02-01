"use client";

/**
 * User management table/cards with Edit modal (name, email, title, role, status)
 * and inline password reset for users.manage (CEO/CTO).
 */

import { useState } from "react";
import { EditModal } from "../../components/EditModal";

type UserRow = {
  id: string;
  name: string;
  email: string;
  title: string | null;
  status: string;
  lastLoginAt: string | null;
  mfaSecret: string | null;
  role: { id: string; name: string };
};

type RoleOption = { id: string; name: string };

type Props = {
  users: UserRow[];
  roles: RoleOption[];
  updateUser: (formData: FormData) => Promise<void>;
  resetUserPassword: (formData: FormData) => Promise<void>;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    suspended: "bg-yellow-100 text-yellow-700",
    deactivated: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export function UserManagementTable({ users, roles, updateUser, resetUserPassword }: Props) {
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const openEdit = (user: UserRow) => {
    setEditingUser(user);
    setShowPasswordReset(false);
  };

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MFA</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.title && <span className="text-xs text-gray-400">{user.title}</span>}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">{user.role.name}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                </td>
                <td className="px-6 py-4">
                  {user.mfaSecret ? (
                    <span className="text-green-600 text-sm">Enabled</span>
                  ) : (
                    <span className="text-gray-400 text-sm">Disabled</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(user)}
                    className="text-sm font-medium text-[#1C6ED5] hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-500">
            No users found
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  {user.title && <p className="text-xs text-gray-400 mt-0.5">{user.title}</p>}
                </div>
                <StatusBadge status={user.status} />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-gray-100 rounded capitalize">{user.role.name}</span>
                <span className="text-gray-500">
                  {user.lastLoginAt ? `Last: ${new Date(user.lastLoginAt).toLocaleDateString()}` : "Never logged in"}
                </span>
                {user.mfaSecret ? (
                  <span className="text-green-600">MFA On</span>
                ) : (
                  <span className="text-gray-400">MFA Off</span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => openEdit(user)}
                  className="text-sm font-medium text-[#1C6ED5] hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit user modal */}
      <EditModal
        open={editingUser !== null}
        onClose={() => setEditingUser(null)}
        title="Edit user"
        titleId="edit-user-modal-title"
        maxWidth="max-w-xl"
      >
        {editingUser && (
          <div className="space-y-6">
            <form action={updateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 text-sm">
              <input type="hidden" name="userId" value={editingUser.id} />
              <div className="sm:col-span-2 min-w-0">
                <label className="block text-xs text-gray-500 uppercase mb-0.5">Name *</label>
                <input
                  name="name"
                  required
                  defaultValue={editingUser.name}
                  className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs text-gray-500 uppercase mb-0.5">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editingUser.email}
                  className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs text-gray-500 uppercase mb-0.5">Title</label>
                <input
                  name="title"
                  defaultValue={editingUser.title ?? ""}
                  className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                  placeholder="e.g. CEO, CTO"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs text-gray-500 uppercase mb-0.5">Role *</label>
                <select
                  name="roleId"
                  required
                  defaultValue={editingUser.role.id}
                  className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="block text-xs text-gray-500 uppercase mb-0.5">Status</label>
                <select
                  name="status"
                  defaultValue={editingUser.status}
                  className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
                >
                  Save changes
                </button>
              </div>
            </form>

            {/* Password reset section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Reset password</h3>
              {!showPasswordReset ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm font-medium text-[#1C6ED5] hover:underline"
                >
                  Set new password for this user
                </button>
              ) : (
                <form action={resetUserPassword} className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 text-sm">
                  <input type="hidden" name="userId" value={editingUser.id} />
                  <div className="min-w-0">
                    <label className="block text-xs text-gray-500 uppercase mb-0.5">New password *</label>
                    <input
                      name="newPassword"
                      type="password"
                      required
                      minLength={12}
                      autoComplete="new-password"
                      className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                      placeholder="Min 12 characters"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs text-gray-500 uppercase mb-0.5">Confirm password *</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={12}
                      autoComplete="new-password"
                      className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                      placeholder="Same as above"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordReset(false)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition font-medium"
                    >
                      Set new password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </EditModal>
    </>
  );
}
