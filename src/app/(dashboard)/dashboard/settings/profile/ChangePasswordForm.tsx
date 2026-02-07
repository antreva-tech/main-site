"use client";

/**
 * Change Password form with complexity validation (same rules as invite/reset).
 */

import { useActionState } from "react";
import { changePassword } from "./actions";
import { PASSWORD_REQUIREMENTS } from "@/lib/passwordPolicy";

/**
 * Form for changing current user password; enforces complexity via server action.
 */
export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePassword, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5"
        >
          Current Password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-gray-500 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
        />
      </div>
      <div>
        <label
          htmlFor="newPassword"
          className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5"
        >
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-gray-500 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
        />
        <p className="text-xs text-[#8A8F98] dark:text-gray-400 mt-1">{PASSWORD_REQUIREMENTS}</p>
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5"
        >
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-gray-500 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
        />
      </div>
      <button
        type="submit"
        className="min-h-[44px] px-4 py-2.5 bg-[#1C6ED5] text-white rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all"
      >
        Update Password
      </button>
    </form>
  );
}
