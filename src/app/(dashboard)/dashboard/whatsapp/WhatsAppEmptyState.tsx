/**
 * WhatsApp Inbox — Empty state component.
 * Senior UX: clear headline, supportive copy, primary CTA, brand-aligned visual.
 */

"use client";

import Link from "next/link";

export interface WhatsAppEmptyStateProps {
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
  /** If true, open CTA link in a new tab with safe attributes. */
  ctaExternal?: boolean;
}

/**
 * Renders an engaging empty state for the WhatsApp inbox with icon, copy, and optional CTA.
 * Uses Antreva brand colors (Tech Blue, Midnight Navy, Slate Gray).
 */
export function WhatsAppEmptyState({
  headline,
  description,
  ctaLabel,
  ctaHref = "#",
  ctaExternal = false,
}: WhatsAppEmptyStateProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-[#8A8F98]/20 bg-white px-6 py-16 text-center shadow-sm sm:px-10 sm:py-20"
      role="status"
      aria-label={headline}
    >
      {/* Visual: WhatsApp-style icon in brand context */}
      <div
        className="mb-6 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10 sm:h-24 sm:w-24"
        aria-hidden
      >
        <svg
          className="h-10 w-10 text-[#25D366] sm:h-12 sm:w-12"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>

      <h2 className="font-heading text-xl font-semibold text-[#0B132B] sm:text-2xl">
        {headline}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#8A8F98] sm:text-base">
        {description}
      </p>

      {ctaLabel && (
        <div className="mt-8">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1C6ED5] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#1559B3] focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-offset-2"
            {...(ctaExternal && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
