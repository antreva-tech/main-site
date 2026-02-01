/**
 * Dashboard Layout for Antreva CRM
 * Protected layout with navigation, user context, and i18n (Spanish/English).
 */

import { redirect } from "next/navigation";
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
  const defaultLocale = localeCookie === "en" || localeCookie === "es" ? localeCookie : "en";

  return (
    <AuthProvider user={session}>
      <LanguageProvider defaultLocale={defaultLocale}>
        <DashboardShell user={session}>{children}</DashboardShell>
      </LanguageProvider>
    </AuthProvider>
  );
}
