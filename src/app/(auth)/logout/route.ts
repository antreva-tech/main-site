/**
 * Logout Route Handler for Antreva CRM
 * Destroys session (cookie + DB) and redirects to login.
 * Cookies may only be modified in Server Actions or Route Handlers.
 */

import { NextResponse } from "next/server";
import { getSession, destroySession } from "@/lib/auth";
import { logLogout } from "@/lib/audit";

/**
 * GET /logout — destroys session and redirects to /login.
 */
export async function GET(request: Request) {
  const session = await getSession();

  if (session) {
    await logLogout(session.id);
    await destroySession();
  }

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
