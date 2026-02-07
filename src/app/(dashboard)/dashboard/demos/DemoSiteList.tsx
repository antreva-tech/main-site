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
  demoLoginUsername: string | null;
  demoLoginPassword: string | null;
  description: string | null;
  sortOrder: number;
};

type Props = {
  demos: DemoSiteRow[];
  canManage: boolean;
};

const linkButtonClass =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg border border-[#1C6ED5]/30 dark:border-[#1C6ED5]/40 bg-[#1C6ED5]/[0.08] dark:bg-[#1C6ED5]/20 text-[#1C6ED5] dark:text-[#7eb8ff] hover:bg-[#1C6ED5]/15 dark:hover:bg-[#1C6ED5]/30 hover:border-[#1C6ED5]/50 transition-all";

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
      <div className="dashboard-card p-8 text-center text-[#8A8F98] dark:text-gray-400">
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
              <h3 className="font-semibold text-[#0B132B] dark:text-gray-100 truncate">{demo.name}</h3>
              {demo.description && (
                <p className="text-sm text-[#8A8F98] dark:text-gray-400 mt-1 line-clamp-2">
                  {demo.description}
                </p>
              )}
              {(demo.demoLoginUsername || demo.demoLoginPassword) && (
                <DemoLoginBlock
                  username={demo.demoLoginUsername}
                  password={demo.demoLoginPassword}
                  t={t}
                />
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
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/15 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(demo)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
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

/** Shows demo login with User and Password labels; password has show/hide toggle. */
function DemoLoginBlock({
  username,
  password,
  t,
}: {
  username: string | null;
  password: string | null;
  t: { dashboard: { demos: { demoLogin: string; userLabel: string; passwordLabel: string; showPassword: string; hidePassword: string } } };
}) {
  const [showPassword, setShowPassword] = useState(false);
  if (!username && !password) return null;
  const { userLabel, passwordLabel } = t.dashboard.demos;
  return (
    <div className="mt-3 pt-3 border-t border-[#0B132B]/[0.08] dark:border-white/10">
      <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {t.dashboard.demos.demoLogin}
      </p>
      <div className="flex flex-col gap-1.5 text-sm">
        {username && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#8A8F98] dark:text-gray-400 shrink-0">{userLabel}:</span>
            <span className="text-[#0B132B]/90 dark:text-gray-200 font-mono truncate" title={username}>
              {username}
            </span>
          </div>
        )}
        {password && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#8A8F98] dark:text-gray-400 shrink-0">{passwordLabel}:</span>
            <code
              className={
                showPassword
                  ? "text-[#0B132B]/90 dark:text-gray-200 font-mono"
                  : "text-[#8A8F98] dark:text-gray-400 font-mono"
              }
            >
              {showPassword ? password : "••••••••"}
            </code>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs font-medium text-[#1C6ED5] dark:text-[#7eb8ff] hover:text-[#1559B3] dark:hover:text-[#9ec9ff]"
            >
              {showPassword ? t.dashboard.demos.hidePassword : t.dashboard.demos.showPassword}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
