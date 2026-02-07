"use client";

/**
 * Roles table with Edit modal (name + permissions).
 * Visible only to users with roles.manage (CEO/CTO).
 */

import { useState } from "react";
import { EditModal } from "../../components/EditModal";

type RoleRow = {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
};

type Props = {
  roles: RoleRow[];
  permissionOptions: Array<{ value: string; label: string }>;
  updateRoleAction: (formData: FormData) => Promise<void>;
};

export function RoleManagementTable({ roles, permissionOptions, updateRoleAction }: Props) {
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);

  return (
    <>
      {/* Desktop: premium table — navy header, subtle row hover (matches clients/tickets/users list) */}
      <div className="hidden md:block dashboard-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B] dark:bg-gray-700">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-white/90 dark:text-gray-100 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80 dark:divide-gray-600">
            {roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <span className="font-semibold text-[#0B132B] dark:text-gray-100 capitalize">{role.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-[#0B132B]/80 dark:text-gray-300">{role.userCount}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setEditingRole(role)}
                    className="text-sm font-medium text-[#1C6ED5] hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-16 text-center text-[#8A8F98] dark:text-gray-400">
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: premium cards with left accent (matches clients/users list) */}
      <div className="md:hidden space-y-4">
        {roles.length === 0 ? (
          <div className="dashboard-card px-6 py-14 text-center text-[#8A8F98] dark:text-gray-400">
            No roles found
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="dashboard-card dashboard-card-accent p-5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#0B132B] dark:text-gray-100 capitalize">{role.name}</p>
                <p className="text-sm text-[#8A8F98] dark:text-gray-400 mt-0.5">{role.userCount} user(s)</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(role)}
                className="text-sm font-medium text-[#1C6ED5] hover:underline shrink-0"
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      <EditModal
        open={editingRole !== null}
        onClose={() => setEditingRole(null)}
        title="Edit role"
        titleId="edit-role-modal-title"
        maxWidth="max-w-xl"
      >
        {editingRole && (
          <form action={updateRoleAction} className="space-y-6">
            <input type="hidden" name="roleId" value={editingRole.id} />
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={editingRole.name}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5] text-sm"
                placeholder="e.g. manager"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1.5">
                Permissions
              </span>
              <div className="space-y-3 max-h-[240px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50/50 dark:bg-gray-700/30">
                {permissionOptions.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 text-sm cursor-pointer text-gray-900 dark:text-gray-100"
                  >
                    <input
                      type="checkbox"
                      name={`permission_${value}`}
                      defaultChecked={editingRole.permissions.includes(value)}
                      className="rounded border-gray-300 dark:border-gray-500 text-[#1C6ED5] focus:ring-[#1C6ED5] focus:ring-2"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
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
        )}
      </EditModal>
    </>
  );
}
