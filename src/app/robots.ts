import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/seo";
import { isAdminHost } from "@/lib/subdomain";

/**
 * robots.txt for crawlers (Google, Bing, AI bots).
 * Marketing site: allows indexing and points to sitemap.
 * Admin subdomain: disallows all indexing for security.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "";

  if (isAdminHost(hostname)) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: [] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
