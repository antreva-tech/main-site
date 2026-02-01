"use client";

/**
 * Client filter bar for audit log: entity type and action dropdowns.
 * Uses custom dropdowns so the open option list is fully styled (brand colors, hover).
 * Updates URL search params on change so the server page re-fetches filtered logs.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";

const ENTITY_OPTIONS = [
  { value: "", label: "All Entity Types" },
  { value: "user", label: "User" },
  { value: "lead", label: "Lead" },
  { value: "client", label: "Client" },
  { value: "client_contact", label: "Client Contact" },
  { value: "ticket", label: "Ticket" },
  { value: "payment", label: "Payment" },
  { value: "subscription", label: "Subscription" },
  { value: "single_charge", label: "Single Charge" },
  { value: "credential", label: "Credential" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "session", label: "Session" },
  { value: "role", label: "Role" },
  { value: "development_project", label: "Development Project" },
  { value: "development_project_log", label: "Development Project Log" },
] as const;

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "read", label: "Read" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "decrypt", label: "Decrypt" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "failed_login", label: "Failed Login" },
] as const;

type Option = { value: string; label: string };

type FilterDropdownProps = {
  id: string;
  label: string;
  options: readonly Option[];
  value: string;
  onSelect: (value: string) => void;
};

const TRIGGER_CLASS =
  "w-full min-w-[160px] sm:w-[180px] pl-4 pr-10 py-3 text-sm text-left text-gray-900 bg-white border border-[#0B132B]/[0.12] rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C6ED5]/30 focus:border-[#1C6ED5] focus:shadow-[0_0_0_3px_rgba(28,110,213,0.12)] cursor-pointer flex items-center justify-between gap-2";

/**
 * Custom dropdown: trigger button + styled option list (brand colors, hover).
 */
function FilterDropdown({ id, label, options, value, onSelect }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? options[0]?.label ?? "";

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("click", handle);
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("click", handle);
      document.removeEventListener("keydown", handle);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <label id={`${id}-label`} className="sr-only">
        {label}
      </label>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        aria-label={label}
        className={TRIGGER_CLASS}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{selectedLabel}</span>
        <span className={`flex-shrink-0 text-[#8A8F98] transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronDown />
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute z-50 mt-1.5 w-full min-w-[160px] sm:min-w-[180px] max-h-[280px] overflow-y-auto rounded-xl border border-[#0B132B]/[0.12] bg-white shadow-lg py-1.5"
        >
          {options.map(({ value: v, label: l }) => (
            <li
              key={v || "all"}
              role="option"
              aria-selected={v === value}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors first:rounded-t-[10px] last:rounded-b-[10px] ${
                v === value
                  ? "bg-[#1C6ED5]/12 text-[#0B132B] font-medium"
                  : "text-gray-700 hover:bg-[#1C6ED5]/10 hover:text-gray-900"
              }`}
              onClick={() => {
                onSelect(v);
                setOpen(false);
              }}
            >
              {l}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

type Props = {
  entityType?: string;
  action?: string;
};

/**
 * Renders entity type and action filter dropdowns; updates URL on change.
 */
export function AuditLogFilters({ entityType = "", action = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = (key: "entityType" | "action", value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/dashboard/settings/audit?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <FilterDropdown
        id="audit-entity-type"
        label="Filter by entity type"
        options={ENTITY_OPTIONS}
        value={entityType}
        onSelect={(v) => setFilter("entityType", v)}
      />
      <FilterDropdown
        id="audit-action"
        label="Filter by action"
        options={ACTION_OPTIONS}
        value={action}
        onSelect={(v) => setFilter("action", v)}
      />
    </div>
  );
}
