"use client";

/**
 * Checkbox to toggle client visibility on the main website showcase.
 * Used in the clients list table and mobile cards.
 */

import { useTransition } from "react";
import { updateClientShowOnWebsite } from "./actions";

type Props = {
  clientId: string;
  showOnWebsite: boolean;
  /** Optional label for screen readers / title */
  label?: string;
};

export function ShowOnSiteCheckbox({ clientId, showOnWebsite, label = "Show on site" }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    startTransition(() => {
      updateClientShowOnWebsite(clientId, !showOnWebsite);
    });
  };

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={showOnWebsite}
        onChange={handleChange}
        disabled={isPending}
        className="rounded border-gray-300 text-[#1C6ED5] focus:ring-[#1C6ED5] disabled:opacity-50"
        aria-label={label}
      />
      <span className="text-sm text-[#0B132B]/80 dark:text-gray-300 select-none">
        {showOnWebsite ? "On site" : "—"}
      </span>
    </label>
  );
}
