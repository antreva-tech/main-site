"use client";

/**
 * Client contacts list with Edit opening a modal; Remove lives in the modal footer.
 */

import { useState } from "react";
import { EditModal } from "../../components/EditModal";

type ContactRow = {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
};

type Props = {
  contacts: ContactRow[];
  clientId: string;
  updateClientContact: (formData: FormData) => Promise<void>;
  deleteClientContact: (formData: FormData) => Promise<void>;
};

export function ClientContacts({
  contacts,
  clientId,
  updateClientContact,
  deleteClientContact,
}: Props) {
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null);

  return (
    <>
      <ul className="space-y-3 mb-4">
        {contacts.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{c.name}</p>
              {c.title && <p className="text-xs text-gray-500">{c.title}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="text-[#1C6ED5] hover:underline truncate max-w-[200px] inline-block"
                    title={c.email}
                  >
                    {c.email}
                  </a>
                )}
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-[#1C6ED5] hover:underline">
                    {c.phone}
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingContact(c)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>

      <EditModal
        open={editingContact !== null}
        onClose={() => setEditingContact(null)}
        title="Edit contact"
        titleId="contact-modal-title"
        footer={
          editingContact ? (
            <form
              action={deleteClientContact}
              onSubmit={(e) => {
                if (!confirm("Remove this contact?")) e.preventDefault();
              }}
              className="inline"
            >
              <input type="hidden" name="contactId" value={editingContact.id} />
              <input type="hidden" name="clientId" value={clientId} />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition"
              >
                Remove
              </button>
            </form>
          ) : null
        }
      >
        {editingContact && (
          <form action={updateClientContact} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="hidden" name="contactId" value={editingContact.id} />
            <input type="hidden" name="clientId" value={clientId} />
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Name *</label>
              <input
                name="name"
                required
                defaultValue={editingContact.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="Contact name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Title</label>
              <input
                name="title"
                defaultValue={editingContact.title ?? ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="e.g. Admin"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 uppercase mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={editingContact.email ?? ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="email@example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 uppercase mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                defaultValue={editingContact.phone ?? ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="+1 809..."
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
                onClick={() => setEditingContact(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </EditModal>
    </>
  );
}
