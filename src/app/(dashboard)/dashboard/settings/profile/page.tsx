/**
 * User Profile Page
 */

import { getSession } from "@/lib/auth";
import { EditNameForm } from "./EditNameForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { updatePreferredLocale } from "./actions";

/**
 * Current user profile page.
 */
export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B132B] tracking-tight mb-6">
        Profile Settings
      </h1>

      {/* 1 col mobile → 2 col md → 3 col xl; uses full width so cards spread out */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Language */}
        <div className="dashboard-card p-5 sm:p-6">
          <h2 className="dashboard-section-title text-lg mb-1">Language</h2>
          <p className="text-sm text-[#8A8F98] mb-4">
            Choose your preferred language for the dashboard.
          </p>
          <LanguageSwitcher variant="light" onLocaleChange={updatePreferredLocale} />
        </div>

        {/* Account Information */}
        <div className="dashboard-card p-5 sm:p-6">
          <h2 className="dashboard-section-title text-lg mb-4">Account Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">
                Name
              </label>
              <EditNameForm currentName={session.name} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <p className="text-[#0B132B]">{session.email}</p>
              <p className="text-xs text-[#8A8F98] mt-1">Contact admin to change email</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">
                Role
              </label>
              <p className="text-[#0B132B] capitalize">{session.roleName}</p>
            </div>

            {session.title && (
              <div>
                <label className="block text-xs font-semibold text-[#8A8F98] uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <p className="text-[#0B132B]">{session.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="dashboard-card p-5 sm:p-6">
          <h2 className="dashboard-section-title text-lg mb-4">Change Password</h2>
          <ChangePasswordForm />
        </div>

        {/* MFA Settings */}
        <div className="dashboard-card p-5 sm:p-6">
          <h2 className="dashboard-section-title text-lg mb-1">Two-Factor Authentication</h2>

          <p className="text-sm text-[#8A8F98] mb-4">
            Add an extra layer of security to your account by enabling two-factor
            authentication.
          </p>

          <button className="min-h-[44px] px-4 py-2.5 border border-[#0B132B]/[0.12] rounded-xl font-medium text-[#0B132B] hover:bg-[#1C6ED5]/[0.06] hover:border-[#1C6ED5]/30 transition-all">
            Setup MFA
          </button>
        </div>
      </div>
    </div>
  );
}
