"use client";

/**
 * Invite User button that opens a modal form to create a new user.
 * Collects name, email, title, role (custom dropdown), and temporary password.
 */

import { useState, useTransition, useRef, useEffect } from "react";
import { PASSWORD_REQUIREMENTS } from "@/lib/passwordPolicy";
import { inviteUser } from "./actions";

type RoleOption = { id: string; name: string };

type Props = {
  roles: RoleOption[];
};

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function InviteUserButton({ roles }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(() => roles[0]?.id ?? "");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setSelectedRoleId(roles[0]?.id ?? "");
  }, [open, roles]);

  useEffect(() => {
    if (!roleDropdownOpen) return;
    const handle = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && roleDropdownRef.current?.contains(e.target as Node)) return;
      setRoleDropdownOpen(false);
    };
    document.addEventListener("click", handle);
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("click", handle);
      document.removeEventListener("keydown", handle);
    };
  }, [roleDropdownOpen]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await inviteUser(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="w-full sm:w-auto px-4 py-2.5 bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition text-center font-medium"
      >
        + Invite User
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite User</h2>

            <form action={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                  placeholder="e.g. CEO, Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <input type="hidden" name="roleId" value={selectedRoleId} required />
                <div ref={roleDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen((o) => !o)}
                    aria-haspopup="listbox"
                    aria-expanded={roleDropdownOpen}
                    aria-label="Select role"
                    className="w-full pl-4 pr-10 py-3 text-sm text-left text-gray-900 bg-white border border-[#0B132B]/[0.12] rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1C6ED5]/30 focus:border-[#1C6ED5] focus:shadow-[0_0_0_3px_rgba(28,110,213,0.12)] cursor-pointer flex items-center justify-between gap-2"
                  >
                    <span className="truncate capitalize">
                      {roles.find((r) => r.id === selectedRoleId)?.name ?? "Select role"}
                    </span>
                    <span className={`flex-shrink-0 text-[#8A8F98] transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`}>
                      <ChevronDown />
                    </span>
                  </button>
                  {roleDropdownOpen && (
                    <ul
                      role="listbox"
                      className="absolute z-50 mt-1.5 w-full max-h-[280px] overflow-y-auto rounded-xl border border-[#0B132B]/[0.12] bg-white shadow-lg py-1.5"
                    >
                      {roles.map((r) => (
                        <li
                          key={r.id}
                          role="option"
                          aria-selected={r.id === selectedRoleId}
                          className={`px-4 py-2.5 text-sm cursor-pointer transition-colors first:rounded-t-[10px] last:rounded-b-[10px] capitalize ${
                            r.id === selectedRoleId
                              ? "bg-[#1C6ED5]/12 text-[#0B132B] font-medium"
                              : "text-gray-700 hover:bg-[#1C6ED5]/10 hover:text-gray-900"
                          }`}
                          onClick={() => {
                            setSelectedRoleId(r.id);
                            setRoleDropdownOpen(false);
                          }}
                        >
                          {r.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={12}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                  placeholder="Min 12 characters"
                />
                <p className="text-xs text-gray-500 mt-1">{PASSWORD_REQUIREMENTS}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={12}
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5]"
                  placeholder="Same as above"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-3 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] font-medium disabled:opacity-60"
                >
                  {isPending ? "Creating…" : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
