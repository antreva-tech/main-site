"use client";

/**
 * User management table/cards with Edit modal (name, email, title, role, status)
 * and inline password reset for users.manage (CEO/CTO).
 */

import { useActionState, useState } from "react";
import { PASSWORD_REQUIREMENTS } from "@/lib/passwordPolicy";
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

type ResetPasswordAction = (prevState: { error?: string } | null, formData: FormData) => Promise<{ error?: string } | null>;

type Props = {
  users: UserRow[];
  roles: RoleOption[];
  updateUser: (formData: FormData) => Promise<void>;
  resetUserPassword: ResetPasswordAction;
};

/** Status badge (user: active, suspended, deactivated). Dark mode uses lighter text for contrast. */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300",
    suspended: "bg-amber-500/12 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300",
    deactivated: "bg-gray-500/12 text-gray-600 dark:bg-gray-500/25 dark:text-gray-400",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-600 dark:bg-gray-500/25 dark:text-gray-400"}`}>
      {status}
    </span>
  );
}

export function UserManagementTable({ users, roles, updateUser, resetUserPassword }: Props) {
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordState, passwordAction] = useActionState(resetUserPassword, null);

  const openEdit = (user: UserRow) => {
    setEditingUser(user);
    setShowPasswordReset(false);
  };

  return (
    <>
      {/* Desktop: premium table — navy header, subtle row hover (matches clients/tickets list) */}
      <div className="hidden md:block dashboard-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B] dark:bg-gray-700">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">User</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">MFA</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 dark:divide-gray-600">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] transition-colors duration-150">
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#0B132B] dark:text-gray-100">{user.name}</p>
                  <p className="text-sm text-[#8A8F98] dark:text-gray-400 mt-0.5">{user.email}</p>
                  {user.title && <span className="text-xs text-[#8A8F98] dark:text-gray-500">{user.title}</span>}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0B132B]/10 text-[#0B132B]/80 dark:bg-gray-500/20 dark:text-gray-300 capitalize">{user.role.name}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4 text-sm text-[#0B132B]/80 dark:text-gray-300">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("en-US") : "Never"}
                </td>
                <td className="px-6 py-4">
                  {user.mfaSecret ? (
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">Enabled</span>
                  ) : (
                    <span className="text-[#8A8F98] dark:text-gray-400 text-sm">Disabled</span>
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
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-[#8A8F98] dark:text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: premium cards with left accent (matches clients list) */}
      <div className="md:hidden space-y-4">
        {users.length === 0 ? (
          <div className="dashboard-card px-6 py-14 text-center text-[#8A8F98] dark:text-gray-400">
            No users found
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="dashboard-card dashboard-card-accent p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0B132B] dark:text-gray-100 truncate">{user.name}</p>
                  <p className="text-sm text-[#8A8F98] dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                  {user.title && <p className="text-xs text-[#8A8F98] dark:text-gray-500 mt-0.5">{user.title}</p>}
                </div>
                <StatusBadge status={user.status} />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 flex flex-wrap items-center gap-3 text-sm text-[#0B132B]/70 dark:text-gray-300">
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0B132B]/10 text-[#0B132B]/80 dark:bg-gray-500/20 dark:text-gray-300 capitalize">{user.role.name}</span>
                <span>
                  {user.lastLoginAt ? `Last: ${new Date(user.lastLoginAt).toLocaleDateString("en-US")}` : "Never logged in"}
                </span>
                {user.mfaSecret ? (
                  <span className="text-emerald-600 dark:text-emerald-400">MFA On</span>
                ) : (
                  <span className="text-[#8A8F98] dark:text-gray-400">MFA Off</span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
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
          <div className="space-y-8">
            <form action={updateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-5 min-w-0 text-sm">
              <input type="hidden" name="userId" value={editingUser.id} />
              <div className="sm:col-span-2 min-w-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Name *
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editingUser.name}
                  className="w-full min-w-0 px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editingUser.email}
                  className="w-full min-w-0 px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Title
                </label>
                <input
                  name="title"
                  defaultValue={editingUser.title ?? ""}
                  className="w-full min-w-0 px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                  placeholder="e.g. CEO, CTO"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Role *
                </label>
                <select
                  name="roleId"
                  required
                  defaultValue={editingUser.role.id}
                  className="w-full min-w-0 px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={editingUser.status}
                  className="w-full min-w-0 px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
                >
                  Save changes
                </button>
              </div>
            </form>

            {/* Password reset section — clearer heading and spacing */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Reset password
              </h3>
              {!showPasswordReset ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm font-medium text-[#1C6ED5] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
                >
                  Set new password for this user
                </button>
              ) : (
                <form action={passwordAction} className="grid grid-cols-1 sm:grid-cols-2 gap-5 min-w-0 text-sm">
                  <input type="hidden" name="userId" value={editingUser.id} />
                  {passwordState?.error && (
                    <p className="sm:col-span-2 text-sm text-red-600 dark:text-red-400" role="alert">
                      {passwordState.error}
                    </p>
                  )}
                  <div className="min-w-0">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                      New password *
                    </label>
                    <input
                      name="newPassword"
                      type="password"
                      required
                      minLength={12}
                      autoComplete="new-password"
                      className="w-full min-w-0 px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                      placeholder="Min 12 characters"
                      title={PASSWORD_REQUIREMENTS}
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                      Confirm password *
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={12}
                      autoComplete="off"
                      className="w-full min-w-0 px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                      placeholder="Same as above"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordReset(false)}
                      className="px-4 py-2.5 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition font-medium"
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
