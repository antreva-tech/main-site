/**
 * Next.js Proxy for Antreva CRM
 * Handles session validation, route protection, and subdomain routing.
 *
 * Subdomain routing (production):
 * - admin.antrevatech.com → Admin panel (login, dashboard, API)
 * - antrevatech.com       → Marketing site (landing page)
 * - localhost              → All routes served (development)
 *
 * Protected routes: /dashboard/*
 * Public routes: /login, /logout, /api/webhooks/*
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isAdminHost,
  isMainHost,
  getAdminUrl,
} from "@/lib/subdomain";

/** Cookie name for session token */
const SESSION_COOKIE = "antreva_session";

/** Routes that require authentication */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Routes that are always public */
const PUBLIC_ROUTES = ["/login", "/logout", "/api/webhooks"];

/** Routes exclusive to the admin subdomain */
const ADMIN_ROUTES = ["/login", "/logout", "/dashboard"];

/**
 * Checks if a path matches any prefix in the list.
 */
function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * Handles subdomain routing for admin.antrevatech.com.
 * Root "/" redirects to /dashboard; all other admin routes serve normally.
 */
function handleAdminSubdomain(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return null;
}

/**
 * Handles routing for antrevatech.com (main marketing site).
 * Redirects admin-only routes (login, dashboard) to admin subdomain.
 */
function handleMainDomain(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;

  if (matchesPrefix(pathname, ADMIN_ROUTES)) {
    const adminUrl = getAdminUrl();
    return NextResponse.redirect(new URL(`${pathname}${search}`, adminUrl));
  }

  return null;
}

/**
 * Proxy function executed on every request.
 * Applies subdomain routing first, then session protection.
 */
export default function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // --- Subdomain routing (production domains only) ---
  if (isAdminHost(hostname)) {
    const adminResponse = handleAdminSubdomain(request);
    if (adminResponse) return adminResponse;
  } else if (isMainHost(hostname)) {
    const mainResponse = handleMainDomain(request);
    if (mainResponse) return mainResponse;
  }
  // localhost / Vercel preview URLs → serve all routes normally

  // --- Route protection (applies on all hosts) ---
  if (matchesPrefix(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  if (matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Full session validation is done in the dashboard layout.
    // Proxy only checks for presence of token for performance.
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
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
