"use client";

/**
 * Modal to edit an existing demo site (name, url, description, sortOrder).
 */

import { useState, useTransition } from "react";
import type { DemoSiteRow } from "./DemoSiteList";

type Props = {
  demo: DemoSiteRow;
  onClose: () => void;
  onSaved: () => void;
  updateAction: (formData: FormData) => Promise<void | { success: boolean }>;
};

export function EditDemoModal({ demo, onClose, onSaved, updateAction }: Props) {
  const [name, setName] = useState(demo.name);
  const [url, setUrl] = useState(demo.url);
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
    formData.set("description", description.trim());
    formData.set("sortOrder", sortOrder);
    startTransition(async () => {
      try {
        await updateAction(formData);
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
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
            Edit demo site
          </h2>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="edit-demo-name" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
              Name
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
              URL
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
            <label htmlFor="edit-demo-desc" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
              Description (optional)
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
              Sort order
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
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
