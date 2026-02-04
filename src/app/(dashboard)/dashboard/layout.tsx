/**
 * Dashboard Layout for Antreva CRM
 * Protected layout with navigation, user context, and i18n (Spanish/English).
 * force-dynamic ensures session is read from current request on every nav (avoids Router Cache serving stale "no session").
 */

import { redirect } from "next/navigation";

/** Prevent layout from being cached so getSession() always runs with current request cookies. */
export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DashboardShell } from "./DashboardShell";

const LOCALE_COOKIE = "locale";

/**
 * Dashboard layout: validates session, wraps with Auth + Language providers,
 * and renders translated shell (sidebar, top bar, language switcher).
 * Reads locale cookie so language persists across refreshes.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const cookieLocale = localeCookie === "en" || localeCookie === "es" ? localeCookie : null;
  const defaultLocale =
    session.preferredLocale ?? cookieLocale ?? "es";

  return (
    <AuthProvider user={session}>
      <LanguageProvider defaultLocale={defaultLocale}>
        <DashboardShell user={session}>{children}</DashboardShell>
      </LanguageProvider>
    </AuthProvider>
  );
}
