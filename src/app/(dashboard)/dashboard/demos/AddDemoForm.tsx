"use client";

/**
 * Inline form to add a new demo site. Shown only to users.manage.
 */

import { useState, useTransition } from "react";
import { createDemoSite } from "./actions";

export function AddDemoForm() {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await createDemoSite(formData);
        setShowForm(false);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add");
      }
    });
  };

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full sm:w-auto px-5 py-2.5 bg-[#1C6ED5] text-white rounded-xl font-medium shadow-sm hover:bg-[#1559B3] transition-all text-center"
      >
        + Add Demo Site
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="dashboard-card p-4 sm:p-5 space-y-4 max-w-md"
    >
      <h3 className="font-semibold text-[#0B132B]">New demo site</h3>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="demo-name" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
          Name
        </label>
        <input
          id="demo-name"
          name="name"
          type="text"
          required
          placeholder="e.g. Restaurant X Demo"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
        />
      </div>
      <div>
        <label htmlFor="demo-url" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
          URL
        </label>
        <input
          id="demo-url"
          name="url"
          type="url"
          required
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
        />
      </div>
      <div>
        <label htmlFor="demo-desc" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
          Description (optional)
        </label>
        <input
          id="demo-desc"
          name="description"
          type="text"
          placeholder="Short note for the team"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
        />
      </div>
      <div>
        <label htmlFor="demo-sort" className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1">
          Sort order (lower = first)
        </label>
        <input
          id="demo-sort"
          name="sortOrder"
          type="number"
          defaultValue={0}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#0B132B] focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-[#1C6ED5] text-white rounded-lg font-medium hover:bg-[#1559B3] disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
