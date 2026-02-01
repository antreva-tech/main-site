/**
 * New Client Page (Direct Entry)
 */

import Link from "next/link";
import { createClient } from "../actions";

/**
 * New client form page.
 */
export default function NewClientPage() {
  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/dashboard/clients"
          className="text-[#1C6ED5] hover:underline text-sm"
        >
          ← Back to Clients
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">New Client</h1>

      <form action={createClient} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Client name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="email@example.com"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              name="company"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Company name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="+1 809 555 1234"
            />
          </div>

          {/* Cedula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cedula (National ID)
            </label>
            <input
              name="cedula"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000-0000000-0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for Dominican clients (invoicing)
            </p>
          </div>

          {/* RNC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RNC (Business Tax ID)
            </label>
            <input
              name="rnc"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000000000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for business clients
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
          <Link
            href="/dashboard/clients"
            className="flex-1 px-4 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 px-4 py-3 min-h-[44px] bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition font-medium"
          >
            Create Client
          </button>
        </div>
      </form>
    </div>
  );
}
