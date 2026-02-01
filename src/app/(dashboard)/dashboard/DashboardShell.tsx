"use client";

/**
 * Dashboard shell: sidebar and top bar.
 * Responsive: sidebar hidden on mobile with drawer overlay; main full width.
 * Uses LanguageContext for Spanish/English translations (language set in Profile Settings).
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SessionUser } from "@/lib/auth";

/** Nav item key for main nav (matches t.dashboard.nav). development is CTO-only. */
const NAV_KEYS = [
  { key: "overview", href: "/dashboard", icon: "📊", permission: undefined as string | undefined },
  { key: "pipeline", href: "/dashboard/pipeline", icon: "🎯", permission: "leads.read" },
  { key: "development", href: "/dashboard/development", icon: "🛠️", ctoOnly: true as const },
  { key: "clients", href: "/dashboard/clients", icon: "👥", permission: "clients.read" },
  { key: "payments", href: "/dashboard/payments", icon: "💰", permission: "payments.read" },
  { key: "tickets", href: "/dashboard/tickets", icon: "🎫", permission: "tickets.read" },
  { key: "credentials", href: "/dashboard/credentials", icon: "🔐", permission: "credentials.read" },
  { key: "whatsapp", href: "/dashboard/whatsapp", icon: "💬", permission: undefined },
] as const;

/** Settings nav keys (matches t.dashboard.settingsNav). Roles and audit are CTO/CEO-only (roles.manage / CTO title). */
const SETTINGS_KEYS = [
  { key: "users", href: "/dashboard/settings/users", icon: "👤", permission: "users.manage" as const },
  { key: "roles", href: "/dashboard/settings/roles", icon: "🔑", permission: "roles.manage" as const },
  { key: "bankAccounts", href: "/dashboard/settings/bank-accounts", icon: "🏦", permission: "users.manage" as const },
  { key: "auditLog", href: "/dashboard/settings/audit", icon: "📋", ctoOnly: true as const },
  { key: "profile", href: "/dashboard/settings/profile", icon: "⚙️", permission: undefined as string | undefined },
] as const;

interface DashboardShellProps {
  user: SessionUser;
  children: React.ReactNode;
}

/** Closes mobile drawer on nav (used by sidebar links). */
function closeDrawer(setOpen: (open: boolean) => void) {
  setOpen(false);
}

/**
 * Renders the dashboard layout with translated sidebar and top bar.
 * On lg+: sidebar fixed left, main ml-64. On &lt;lg: sidebar in drawer overlay, main full width.
 */
export function DashboardShell({ user, children }: DashboardShellProps) {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = t.dashboard.nav;
  const settingsNav = t.dashboard.settingsNav;

  return (
    <div className="min-h-screen bg-gray-50 bg-grid-pattern flex">
      {/* Mobile backdrop: close drawer on tap */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: fixed on lg; on mobile slides in as overlay when sidebarOpen */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0B132B] text-white flex flex-col z-50 transition-transform duration-200 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <Link
            href="/dashboard"
            onClick={() => closeDrawer(setSidebarOpen)}
            className="flex items-center justify-center bg-white rounded-lg p-3 block"
          >
            <Image
              src="/Antreva Tech Transparente.png"
              alt="Antreva Tech"
              width={160}
              height={48}
              className="mx-auto"
            />
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto min-h-0 scrollbar-hide">
          <ul className="space-y-1">
            {NAV_KEYS.filter((item) => {
              if ("ctoOnly" in item && item.ctoOnly) return user.title === "CTO";
              const perm = "permission" in item ? item.permission : undefined;
              return !perm || user.permissions.includes(perm);
            }).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => closeDrawer(setSidebarOpen)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[#1C6ED5]/20 transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{nav[item.key]}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {t.dashboard.settings}
            </h3>
            <ul className="space-y-1">
              {SETTINGS_KEYS.filter((item) => {
                if ("ctoOnly" in item && item.ctoOnly) {
                  return user.title === "CTO";
                }
                if (!("permission" in item)) return false;
                return !item.permission || user.permissions.includes(item.permission);
              }).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => closeDrawer(setSidebarOpen)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[#1C6ED5]/20 transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{settingsNav[item.key]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1C6ED5] flex items-center justify-center text-white font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.title || user.roleName}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 ml-0 lg:ml-64 flex flex-col">
        <header className="flex-shrink-0 sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex-shrink-0 p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1C6ED5]"
                aria-label={t.dashboard.title}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{t.dashboard.title}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/logout"
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t.dashboard.signOut}
              </Link>
            </div>
          </div>
        </header>
        <div className="flex-1 min-w-0 min-h-0 flex flex-col p-4 sm:p-6 bg-gray-50 bg-grid-pattern">
          {children}
        </div>
      </main>
    </div>
  );
}
