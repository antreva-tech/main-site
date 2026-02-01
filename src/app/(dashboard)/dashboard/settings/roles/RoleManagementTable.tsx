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
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B132B]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-white/90 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/80">
            {roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-[#1C6ED5]/[0.06] transition-colors duration-150"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900 capitalize">{role.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{role.userCount}</td>
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
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3"
          >
            <div>
              <p className="font-medium text-gray-900 capitalize">{role.name}</p>
              <p className="text-sm text-gray-500">{role.userCount} user(s)</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingRole(role)}
              className="text-sm font-medium text-[#1C6ED5] hover:underline"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      <EditModal
        open={editingRole !== null}
        onClose={() => setEditingRole(null)}
        title="Edit role"
        titleId="edit-role-modal-title"
        maxWidth="max-w-xl"
      >
        {editingRole && (
          <form action={updateRoleAction} className="space-y-4">
            <input type="hidden" name="roleId" value={editingRole.id} />
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={editingRole.name}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                placeholder="e.g. manager"
              />
            </div>
            <div>
              <span className="block text-xs text-gray-500 uppercase mb-2">Permissions</span>
              <div className="space-y-2 max-h-[240px] overflow-y-auto rounded-md border border-gray-200 p-3">
                {permissionOptions.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name={`permission_${value}`}
                      defaultChecked={editingRole.permissions.includes(value)}
                      className="rounded border-gray-300 text-[#1C6ED5] focus:ring-[#1C6ED5]"
                    />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] font-medium"
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
