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
      <ul className="space-y-3 mb-5">
        {contacts.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#0B132B]/[0.08] bg-white/80 hover:bg-white hover:border-[#1C6ED5]/20 transition-all duration-200"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#0B132B]">{c.name}</p>
              {c.title && <p className="text-xs text-[#8A8F98] mt-0.5">{c.title}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    title={c.email}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-[#1C6ED5]/30 bg-[#1C6ED5]/[0.08] text-[#1C6ED5] hover:bg-[#1C6ED5]/15 hover:border-[#1C6ED5]/50 transition-all"
                  >
                    <span aria-hidden>✉️</span> Email
                  </a>
                )}
                {c.phone && (
                  <>
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-violet-500/30 bg-violet-500/[0.08] text-violet-700 hover:bg-violet-500/15 hover:border-violet-500/50 transition-all"
                    >
                      <span aria-hidden>📞</span> Call
                    </a>
                    <a
                      href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-[#25D366]/40 bg-[#25D366]/[0.12] text-[#128C7E] hover:bg-[#25D366]/20 hover:border-[#25D366]/60 transition-all"
                    >
                      <span aria-hidden>💬</span> WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditingContact(c)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-[#0B132B]/[0.12] bg-white text-[#0B132B] hover:bg-[#1C6ED5]/[0.06] hover:border-[#1C6ED5]/30 transition-all"
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
