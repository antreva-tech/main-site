/**
 * Next.js Proxy for Antreva CRM
 * Handles session validation and route protection.
 * 
 * Protected routes: /dashboard/*
 * Public routes: /login, /logout, /api/webhooks/*
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Cookie name for session token */
const SESSION_COOKIE = "antreva_session";

/** Routes that require authentication */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Routes that are always public */
const PUBLIC_ROUTES = ["/login", "/logout", "/api/webhooks"];

/**
 * Checks if a path matches any prefix in the list.
 */
function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * Proxy function executed on every request.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (matchesPrefix(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

    if (!sessionToken) {
      // Redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Full session validation is done in the dashboard layout
    // Proxy only checks for presence of token for performance
  }

  return NextResponse.next();
}

/**
 * Configure which routes the proxy runs on.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
