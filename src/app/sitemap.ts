import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Dynamic sitemap for search engine crawlers (Google, Bing, etc.).
 * Single-page site: homepage only. Add more URLs as routes grow.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];
}
