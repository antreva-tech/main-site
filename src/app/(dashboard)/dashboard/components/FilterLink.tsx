"use client";

/**
 * Shared filter pill link for list pages (clients, tickets, payments).
 * Single design: pill shape, brand colors (Tech Blue active, Slate Gray inactive).
 * Use for status/segment filters above tables or cards.
 */

import Link from "next/link";

export interface FilterLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

/**
 * Filter pill: active = Tech Blue; inactive = Slate Gray with subtle border.
 * Matches clients list style for consistency across dashboard.
 */
export function FilterLink({ href, active, children }: FilterLinkProps) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-200 ${
        active
          ? "bg-[#1C6ED5] text-white shadow-sm"
          : "bg-white/80 text-[#8A8F98] hover:bg-white hover:text-[#0B132B] border border-[#0B132B]/10"
      }`}
    >
      {children}
    </Link>
  );
}
