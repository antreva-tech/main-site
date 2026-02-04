"use client";

import React, { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LINE_OF_BUSINESS_VALUES } from "@/lib/lineOfBusiness";
import { ScrollReveal } from "./ScrollReveal";

export type ShowcaseClient = {
  id: string;
  name: string;
  company: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  lineOfBusiness: string | null;
};

type Props = {
  /** Clients with showOnWebsite true and non-null websiteUrl (from server). */
  clients: ShowcaseClient[];
};

/** Display order: known line-of-business keys, then "other" for null/unknown. */
const ORDERED_GROUP_KEYS = [...LINE_OF_BUSINESS_VALUES, "other"];

/**
 * Groups clients by line of business for sectioned display.
 * Returns array of [groupKey, clients] in display order; only includes non-empty groups.
 */
function groupByLineOfBusiness(clients: ShowcaseClient[]): Array<[string, ShowcaseClient[]]> {
  const map = new Map<string, ShowcaseClient[]>();
  for (const c of clients) {
    const key = c.lineOfBusiness ?? "other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  const result: Array<[string, ShowcaseClient[]]> = [];
  for (const key of ORDERED_GROUP_KEYS) {
    const group = map.get(key);
    if (group?.length) result.push([key, group]);
  }
  return result;
}

/**
 * Client showcase section for the main site.
 * Lists opted-in clients grouped by line of business with links to their sites.
 */
export function ClientShowcase({ clients }: Props) {
  const { t } = useLanguage();
  const withUrl = clients.filter((c) => c.websiteUrl);
  const groups = useMemo(() => groupByLineOfBusiness(withUrl), [withUrl]);

  if (withUrl.length === 0) return null;

  const options = t.showcase.lineOfBusinessOptions as Record<string, string>;

  return (
    <section
      id="clients"
      className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-tech-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-midnight-navy/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variant="fadeUp" className="text-center mb-10 sm:mb-12">
          <span className="inline-block text-tech-blue font-medium text-xs sm:text-sm tracking-wider uppercase bg-tech-blue/10 px-3 py-1 rounded-full">
            {t.showcase.tagline}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-midnight-navy mt-3">
            {t.showcase.title}
          </h2>
          <p className="text-slate-gray/80 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            {t.showcase.description}
          </p>
        </ScrollReveal>

        {groups.map(([groupKey, groupClients]) => (
          <div key={groupKey} className="mb-10 last:mb-0">
            <ScrollReveal variant="fadeUp">
              <h3 className="text-lg font-semibold text-midnight-navy mb-4 sm:mb-6 border-b border-slate-gray/20 pb-2">
                {options[groupKey] ?? groupKey}
              </h3>
            </ScrollReveal>
            <ScrollReveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {groupClients.map((client) => (
                <a
                  key={client.id}
                  href={client.websiteUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl p-5 sm:p-6 bg-white border border-slate-gray/20 shadow-sm hover:shadow-lg hover:border-tech-blue/30 transition-all"
                >
                  <div className="flex-1 min-w-0 flex flex-col items-center text-center">
                    {client.logoUrl ? (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={client.logoUrl}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : null}
                    <h3 className="font-semibold text-midnight-navy text-lg truncate w-full group-hover:text-tech-blue transition-colors">
                      {client.company || client.name}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-tech-blue">
                    {t.showcase.visitSite}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </span>
                </a>
              ))}
            </ScrollReveal>
          </div>
        ))}
      </div>
    </section>
  );
}
