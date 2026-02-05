/**
 * New Client Page (Direct Entry)
 * Uses locale from cookie for Spanish/English labels and placeholders.
 */

import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "../actions";
import { LogoUrlField } from "./LogoUrlField";
import { LINE_OF_BUSINESS_VALUES } from "@/lib/lineOfBusiness";
import { getTranslations } from "@/i18n";

const LOCALE_COOKIE = "locale";

/**
 * New client form page. Locale from cookie so labels/placeholders match dashboard language.
 */
export default async function NewClientPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeCookie === "en" || localeCookie === "es" ? localeCookie : "es";
  const t = getTranslations(locale);

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link
          href="/dashboard/clients"
          className="text-[#1C6ED5] hover:underline text-sm"
        >
          ← {t.dashboard.clients.backToClients}
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{t.dashboard.clients.newClient}</h1>

      <form action={createClient} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.nameRequired}
            </label>
            <input
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.clientNamePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.emailRequired}
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.emailPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.company}
            </label>
            <input
              name="company"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.companyPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.common.lineOfBusiness}
            </label>
            <select
              name="lineOfBusiness"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
            >
              <option value="">—</option>
              {LINE_OF_BUSINESS_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t.dashboard.common.lineOfBusinessOptions[value as keyof typeof t.dashboard.common.lineOfBusinessOptions]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.websiteUrl}
            </label>
            <input
              type="url"
              name="websiteUrl"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.websitePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.adminPortalUrl}
            </label>
            <input
              type="url"
              name="adminPortalUrl"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.adminPortalPlaceholder}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOnWebsite"
              name="showOnWebsite"
              className="rounded border-gray-300 text-[#1C6ED5] focus:ring-[#1C6ED5]"
            />
            <label htmlFor="showOnWebsite" className="text-sm text-gray-700">
              {t.dashboard.clients.showOnWebsiteLabel}
            </label>
          </div>

          <LogoUrlField />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.phone}
            </label>
            <input
              type="tel"
              name="phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.phonePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.cedulaLabel}
            </label>
            <input
              name="cedula"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.cedulaPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.dashboard.clients.cedulaHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.rncLabel}
            </label>
            <input
              name="rnc"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.rncPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.dashboard.clients.rncHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.dashboard.clients.notes}
            </label>
            <textarea
              name="notes"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder={t.dashboard.clients.notesPlaceholder}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
          <Link
            href="/dashboard/clients"
            className="flex-1 px-4 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition min-h-[44px] flex items-center justify-center"
          >
            {t.dashboard.common.cancel}
          </Link>
          <button
            type="submit"
            className="flex-1 px-4 py-3 min-h-[44px] bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition font-medium"
          >
            {t.dashboard.common.createClient}
          </button>
        </div>
      </form>
    </div>
  );
}
