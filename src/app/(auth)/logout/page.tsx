/**
 * Logout Page for Antreva CRM
 * Destroys session and redirects to login.
 */

import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/auth";
import { logLogout } from "@/lib/audit";

/**
 * Logout page - destroys session on load.
 */
export default async function LogoutPage() {
  const session = await getSession();

  if (session) {
    // Log the logout event
    await logLogout(session.id);
    // Destroy the session
    await destroySession();
  }

  redirect("/login");
}
