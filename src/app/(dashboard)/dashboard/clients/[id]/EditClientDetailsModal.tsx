"use client";

/**
 * Edit client details in a modal (shared EditModal).
 * Logo can be pasted as URL or uploaded to Vercel Blob.
 */

import { useState, useTransition, useEffect } from "react";
import { EditModal } from "../../components/EditModal";
import { uploadClientLogo } from "../actions";

type ClientForEdit = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  websiteUrl: string | null;
  showOnWebsite: boolean;
  logoUrl: string | null;
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
  const [logoUrl, setLogoUrl] = useState(client.logoUrl ?? "");
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setLogoUrl(client.logoUrl ?? "");
      setLogoUploadError(null);
    }
  }, [open, client.logoUrl]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploadError(null);
    const fd = new FormData();
    fd.set("file", file);
    startUploadTransition(async () => {
      const result = await uploadClientLogo(fd);
      if (result.url) {
        setLogoUrl(result.url);
      } else {
        setLogoUploadError(result.error ?? "Upload failed");
      }
    });
    e.target.value = "";
  };

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
        maxWidth="max-w-xl"
        scrollContent={false}
      >
        <form
          action={updateClient}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          onSubmit={() => setOpen(false)}
        >
          <input type="hidden" name="clientId" value={client.id} />
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Name *</label>
            <input
              name="name"
              required
              defaultValue={client.name}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Client name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Email *</label>
            <input
              type="email"
              name="email"
              required
              defaultValue={client.email}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Company</label>
            <input
              name="company"
              defaultValue={client.company ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Company name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Website URL</label>
            <input
              type="url"
              name="websiteUrl"
              defaultValue={client.websiteUrl ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="https://example.com"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="showOnWebsite"
              name="showOnWebsite"
              defaultChecked={client.showOnWebsite}
              className="rounded border-gray-300 text-[#1C6ED5] focus:ring-[#1C6ED5]"
            />
            <label htmlFor="showOnWebsite" className="text-sm text-gray-700">
              Show on main website (client showcase). Requires Website URL.
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Logo (showcase card)</label>
            <input
              type="url"
              name="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Paste URL or upload below"
            />
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
                {isUploading ? "Uploading…" : "Upload to Vercel Blob"}
              </label>
              {logoUrl && (
                <span className="text-xs text-gray-500 truncate max-w-[180px]" title={logoUrl}>
                  Stored in Blob
                </span>
              )}
            </div>
            {logoUploadError && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {logoUploadError}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Phone</label>
            <input
              type="tel"
              name="phone"
              defaultValue={client.phone ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="+1 809 555 1234"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Status</label>
            <select
              name="status"
              defaultValue={client.status}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Cedula (National ID)</label>
            <input
              name="cedula"
              defaultValue={client.cedula ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000-0000000-0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">RNC (Business Tax ID)</label>
            <input
              name="rnc"
              defaultValue={client.rnc ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000000000"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-0.5">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={client.notes ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
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
