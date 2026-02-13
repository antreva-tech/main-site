/**
 * Subdomain detection and domain routing constants.
 * Used by the proxy middleware to route requests based on hostname.
 *
 * Domain mapping:
 * - antrevatech.com / www.antrevatech.com → Marketing site
 * - admin.antrevatech.com                 → Admin panel (login + CRM dashboard)
 * - localhost                              → All routes (development)
 */

/** Main marketing domain (without www) */
export const MAIN_DOMAIN = "antrevatech.com";

/** Admin subdomain prefix */
export const ADMIN_SUBDOMAIN = "admin";

/** Full admin hostname (e.g. admin.antrevatech.com) */
export const ADMIN_HOST = `${ADMIN_SUBDOMAIN}.${MAIN_DOMAIN}`;

/**
 * Returns the admin panel base URL for the current environment.
 * Override via NEXT_PUBLIC_ADMIN_URL for custom setups.
 */
export function getAdminUrl(): string {
  return process.env.NEXT_PUBLIC_ADMIN_URL || `https://${ADMIN_HOST}`;
}

/**
 * Returns the main marketing site base URL for the current environment.
 * Override via NEXT_PUBLIC_SITE_URL for custom setups.
 */
export function getMainUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || `https://www.${MAIN_DOMAIN}`;
}

/**
 * Strips port number from a hostname for comparison.
 * @param hostname - Hostname potentially including port (e.g. "localhost:3000")
 */
function stripPort(hostname: string): string {
  return hostname.split(":")[0];
}

/**
 * Checks if the hostname corresponds to the admin subdomain.
 * Matches: admin.antrevatech.com (prod), admin.localhost (dev)
 * @param hostname - Full hostname from request headers
 */
export function isAdminHost(hostname: string): boolean {
  const host = stripPort(hostname);
  return host === ADMIN_HOST || host === `${ADMIN_SUBDOMAIN}.localhost`;
}

/**
 * Checks if the hostname corresponds to the main marketing site.
 * Matches: antrevatech.com, www.antrevatech.com (prod only)
 * @param hostname - Full hostname from request headers
 */
export function isMainHost(hostname: string): boolean {
  const host = stripPort(hostname);
  return host === MAIN_DOMAIN || host === `www.${MAIN_DOMAIN}`;
}
