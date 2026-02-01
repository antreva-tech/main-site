/**
 * User Profile Page
 */

import { getSession } from "@/lib/auth";
import { EditNameForm } from "./EditNameForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/**
 * Current user profile page.
 */
export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      {/* Language */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Language
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose your preferred language for the dashboard.
        </p>
        <LanguageSwitcher variant="light" />
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Account Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <EditNameForm currentName={session.name} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{session.email}</p>
            <p className="text-xs text-gray-500 mt-1">Contact admin to change email</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <p className="text-gray-900 capitalize">{session.roleName}</p>
          </div>

          {session.title && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <p className="text-gray-900">{session.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Change Password
        </h2>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 12 characters with complexity
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-3 min-h-[44px] bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition font-medium"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* MFA Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Two-Factor Authentication
        </h2>

        <p className="text-gray-600 mb-4">
          Add an extra layer of security to your account by enabling two-factor
          authentication.
        </p>

        <button className="px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
          Setup MFA
        </button>
      </div>
    </div>
  );
}
