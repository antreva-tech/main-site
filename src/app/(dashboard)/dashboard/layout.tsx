/**
 * Dashboard Layout for Antreva CRM
 * Protected layout with navigation, user context, and i18n (Spanish/English).
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DashboardShell } from "./DashboardShell";

/**
 * Dashboard layout: validates session, wraps with Auth + Language providers,
 * and renders translated shell (sidebar, top bar, language switcher).
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

  return (
    <AuthProvider user={session}>
      <LanguageProvider>
        <DashboardShell user={session}>{children}</DashboardShell>
      </LanguageProvider>
    </AuthProvider>
  );
}
