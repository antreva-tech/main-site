"use client";

/**
 * List of demo sites with Website and Admin portal buttons; optional Edit/Delete for users.manage.
 */

import { useState, useTransition } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { updateDemoSite, deleteDemoSite } from "./actions";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EditDemoModal } from "./EditDemoModal";

export type DemoSiteRow = {
  id: string;
  name: string;
  url: string;
  adminPortalUrl: string | null;
  description: string | null;
  sortOrder: number;
};

type Props = {
  demos: DemoSiteRow[];
  canManage: boolean;
};

const linkButtonClass =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg border border-[#1C6ED5]/30 bg-[#1C6ED5]/[0.08] text-[#1C6ED5] hover:bg-[#1C6ED5]/15 hover:border-[#1C6ED5]/50 transition-all";

export function DemoSiteList({ demos, canManage }: Props) {
  const { t } = useLanguage();
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
                href={demo.url.startsWith("http") ? demo.url : `https://${demo.url}`}
                target="_blank"
                rel="noopener noreferrer"
                title={demo.url}
                className={linkButtonClass}
              >
                <span aria-hidden>↗</span> {t.dashboard.clients.openWebsite}
              </a>
              {demo.adminPortalUrl && (
                <a
                  href={demo.adminPortalUrl.startsWith("http") ? demo.adminPortalUrl : `https://${demo.adminPortalUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={demo.adminPortalUrl}
                  className={linkButtonClass}
                >
                  <span aria-hidden>↗</span> {t.dashboard.clients.openAdminPortal}
                </a>
              )}
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
