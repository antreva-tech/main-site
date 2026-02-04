"use client";

/**
 * Edit client details in a modal (shared EditModal).
 * Logo can be pasted as URL or uploaded to Vercel Blob.
 */

import { useState, useTransition, useEffect } from "react";
import { EditModal } from "../../components/EditModal";
import { uploadClientLogo } from "../actions";
import { LINE_OF_BUSINESS_VALUES } from "@/lib/lineOfBusiness";
import { useLanguage } from "@/contexts/LanguageContext";

type ClientForEdit = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  lineOfBusiness: string | null;
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
  const { t } = useLanguage();
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
        {t.dashboard.clients.editClientDetails}
      </button>
      <EditModal
        open={open}
        onClose={() => setOpen(false)}
        title={t.dashboard.clients.editClientDetails}
        titleId="edit-client-modal-title"
        maxWidth="max-w-xl"
        scrollContent={true}
      >
        <form
          action={updateClient}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          onSubmit={() => setOpen(false)}
        >
          <input type="hidden" name="clientId" value={client.id} />
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.nameRequired}</label>
            <input
              name="name"
              required
              defaultValue={client.name}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.clientNamePlaceholder}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.emailRequired}</label>
            <input
              type="email"
              name="email"
              required
              defaultValue={client.email}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.emailPlaceholder}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.company}</label>
            <input
              name="company"
              defaultValue={client.company ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.companyPlaceholder}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.common.lineOfBusiness}</label>
            <select
              name="lineOfBusiness"
              defaultValue={client.lineOfBusiness ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            >
              <option value="">—</option>
              {LINE_OF_BUSINESS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t.dashboard.common.lineOfBusinessOptions[value as keyof typeof t.dashboard.common.lineOfBusinessOptions]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.websiteUrl}</label>
            <input
              type="url"
              name="websiteUrl"
              defaultValue={client.websiteUrl ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.websitePlaceholder}
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
              {t.dashboard.clients.showOnWebsiteLabel}
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.logoLabel}</label>
            <input
              type="url"
              name="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.logoPlaceholder}
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
                {isUploading ? t.dashboard.clients.uploadUploading : t.dashboard.clients.uploadButton}
              </label>
              {logoUrl && (
                <span className="text-xs text-gray-500 truncate max-w-[180px]" title={logoUrl}>
                  {t.dashboard.clients.storedInBlob}
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
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.phone}</label>
            <input
              type="tel"
              name="phone"
              defaultValue={client.phone ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.phonePlaceholder}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.status}</label>
            <select
              name="status"
              defaultValue={client.status}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            >
              <option value="active">{t.dashboard.clients.active}</option>
              <option value="inactive">{t.dashboard.clients.inactive}</option>
              <option value="churned">{t.dashboard.clients.churned}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.cedulaLabel}</label>
            <input
              name="cedula"
              defaultValue={client.cedula ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.cedulaPlaceholder}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.rncLabel}</label>
            <input
              name="rnc"
              defaultValue={client.rnc ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.rncPlaceholder}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-0.5">{t.dashboard.clients.notes}</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={client.notes ?? ""}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.notesPlaceholder}
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
            >
              {t.dashboard.common.saveChanges}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
            >
              {t.dashboard.common.cancel}
            </button>
          </div>
        </form>
      </EditModal>
    </>
  );
}
