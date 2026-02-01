"use client";

/**
 * Admin credentials list with Edit opening a modal; Delete lives in the modal footer.
 */

import Link from "next/link";
import { useState } from "react";
import { EditModal } from "../../components/EditModal";

type CredentialRow = { id: string; label: string };

type Props = {
  credentials: CredentialRow[];
  clientId: string;
  updateCredential: (formData: FormData) => Promise<void>;
  deleteCredential: (formData: FormData) => Promise<void>;
};

export function ClientCredentials({
  credentials,
  clientId,
  updateCredential,
  deleteCredential,
}: Props) {
  const [editingCred, setEditingCred] = useState<CredentialRow | null>(null);

  return (
    <>
      <ul className="space-y-2 mb-4">
        {credentials.map((cred) => (
          <li key={cred.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-medium text-gray-900">{cred.label}</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/credentials?clientId=${clientId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  View / Decrypt
                </Link>
                <button
                  type="button"
                  onClick={() => setEditingCred(cred)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <EditModal
        open={editingCred !== null}
        onClose={() => setEditingCred(null)}
        title="Edit credential"
        titleId="credential-modal-title"
        footer={
          editingCred ? (
            <form
              action={deleteCredential}
              onSubmit={(e) => {
                if (!confirm("Delete this credential? This cannot be undone.")) e.preventDefault();
              }}
              className="inline"
            >
              <input type="hidden" name="credentialId" value={editingCred.id} />
              <input type="hidden" name="clientId" value={clientId} />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition"
              >
                Delete
              </button>
            </form>
          ) : null
        }
      >
        {editingCred && (
          <form
            action={updateCredential}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            onSubmit={() => setEditingCred(null)}
          >
            <input type="hidden" name="credentialId" value={editingCred.id} />
            <input type="hidden" name="clientId" value={clientId} />
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Label *</label>
              <input
                name="label"
                required
                defaultValue={editingCred.label}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="e.g. Admin panel"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">New value (leave blank to keep)</label>
              <input
                type="password"
                name="value"
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setEditingCred(null)}
                className="min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </EditModal>
    </>
  );
}
