"use client";

/**
 * Modal to edit an existing demo site. Uses LanguageContext for labels and buttons.
 */

import { useState, useTransition } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DemoSiteRow } from "./DemoSiteList";

type Props = {
  demo: DemoSiteRow;
  onClose: () => void;
  onSaved: () => void;
  updateAction: (formData: FormData) => Promise<void | { success: boolean }>;
};

export function EditDemoModal({ demo, onClose, onSaved, updateAction }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState(demo.name);
  const [url, setUrl] = useState(demo.url);
  const [adminPortalUrl, setAdminPortalUrl] = useState(demo.adminPortalUrl ?? "");
  const [description, setDescription] = useState(demo.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(demo.sortOrder));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("id", demo.id);
    formData.set("name", name.trim());
    formData.set("url", url.trim());
    formData.set("adminPortalUrl", adminPortalUrl.trim());
    formData.set("description", description.trim());
    formData.set("sortOrder", sortOrder);
    startTransition(async () => {
      try {
        await updateAction(formData);
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : t.dashboard.demos.updateFailed);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-demo-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <h2 id="edit-demo-title" className="text-lg font-semibold text-[#0B132B]">
            {t.dashboard.demos.editDemoSite}
          </h2>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="edit-demo-name" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
              {t.dashboard.demos.name}
            </label>
            <input
              id="edit-demo-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
            />
          </div>
          <div>
            <label htmlFor="edit-demo-url" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
              {t.dashboard.clients.websiteUrl}
            </label>
            <input
              id="edit-demo-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
            />
          </div>
          <div>
            <label htmlFor="edit-demo-admin-url" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
              {t.dashboard.clients.adminPortalUrl}
            </label>
            <input
              id="edit-demo-admin-url"
              type="url"
              value={adminPortalUrl}
              onChange={(e) => setAdminPortalUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
            />
          </div>
          <div>
            <label htmlFor="edit-demo-desc" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
              {t.dashboard.demos.descriptionOptional}
            </label>
            <input
              id="edit-demo-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
            />
          </div>
          <div>
            <label htmlFor="edit-demo-sort" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
              {t.dashboard.demos.sortOrder}
            </label>
            <input
              id="edit-demo-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-[#1C6ED5] text-white rounded-lg font-medium hover:bg-[#1559B3] disabled:opacity-50"
            >
              {isPending ? t.dashboard.demos.saving : t.dashboard.demos.save}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              {t.dashboard.common.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
