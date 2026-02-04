"use client";

/**
 * List of demo sites with Open link and optional Edit/Delete for users.manage.
 */

import { useState, useTransition } from "react";
import { updateDemoSite, deleteDemoSite } from "./actions";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EditDemoModal } from "./EditDemoModal";

export type DemoSiteRow = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  sortOrder: number;
};

type Props = {
  demos: DemoSiteRow[];
  canManage: boolean;
};

export function DemoSiteList({ demos, canManage }: Props) {
  const [editing, setEditing] = useState<DemoSiteRow | null>(null);
  const [deleting, setDeleting] = useState<DemoSiteRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleting) return;
    startTransition(() => {
      const fd = new FormData();
      fd.set("id", deleting.id);
      deleteDemoSite(fd).then(() => setDeleting(null));
    });
  };

  if (demos.length === 0) {
    return (
      <div className="dashboard-card p-8 text-center text-[#8A8F98]">
        <p>No demo sites yet. {canManage ? "Add one using the button above." : ""}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <div
            key={demo.id}
            className="dashboard-card p-4 sm:p-5 flex flex-col gap-3"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[#0B132B] truncate">{demo.name}</h3>
              {demo.description && (
                <p className="text-sm text-[#8A8F98] mt-1 line-clamp-2">
                  {demo.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={demo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C6ED5] text-white text-sm font-medium rounded-lg hover:bg-[#1559B3] transition-colors"
              >
                Open
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              {canManage && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(demo)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(demo)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditDemoModal
          demo={editing}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
          updateAction={updateDemoSite}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete demo site?"
        message={deleting ? `Remove "${deleting.name}" from the list? This cannot be undone.` : ""}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
