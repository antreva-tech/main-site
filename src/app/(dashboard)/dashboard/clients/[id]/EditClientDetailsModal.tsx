"use client";

/**
 * Edit client details in a modal (shared EditModal).
 */

import { useState } from "react";
import { EditModal } from "../../components/EditModal";

type ClientForEdit = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  websiteUrl: string | null;
  cedula: string | null;
  rnc: string | null;
  notes: string | null;
  status: string;
};

type Props = {
  client: ClientForEdit;
  updateClient: (formData: FormData) => Promise<void>;
};

export function EditClientDetailsModal({ client, updateClient }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-[#1C6ED5] hover:underline"
      >
        Edit client details
      </button>
      <EditModal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit client details"
        titleId="edit-client-modal-title"
        maxWidth="max-w-2xl"
      >
        <form
          action={updateClient}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          onSubmit={() => setOpen(false)}
        >
          <input type="hidden" name="clientId" value={client.id} />
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">Name *</label>
            <input
              name="name"
              required
              defaultValue={client.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Client name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Email *</label>
            <input
              type="email"
              name="email"
              required
              defaultValue={client.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Company</label>
            <input
              name="company"
              defaultValue={client.company ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Company name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Website URL</label>
            <input
              type="url"
              name="websiteUrl"
              defaultValue={client.websiteUrl ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              defaultValue={client.phone ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="+1 809 555 1234"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Status</label>
            <select
              name="status"
              defaultValue={client.status}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Cedula (National ID)</label>
            <input
              name="cedula"
              defaultValue={client.cedula ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000-0000000-0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">RNC (Business Tax ID)</label>
            <input
              name="rnc"
              defaultValue={client.rnc ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000000000"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">Notes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={client.notes ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Additional notes..."
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </EditModal>
    </>
  );
}
