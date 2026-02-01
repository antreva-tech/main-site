/**
 * Client Edit Page
 * Edit client details including website URL.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateClient } from "../../actions";

/**
 * Edit client form page.
 */
export default async function ClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      websiteUrl: true,
      cedula: true,
      rnc: true,
      notes: true,
      status: true,
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="text-[#1C6ED5] hover:underline text-sm"
        >
          ← Back to Client
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Edit Client
      </h1>

      <form
        action={updateClient}
        className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
      >
        <input type="hidden" name="clientId" value={client.id} />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              name="name"
              required
              defaultValue={client.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Client name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={client.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              name="company"
              defaultValue={client.company ?? ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              name="websiteUrl"
              defaultValue={client.websiteUrl ?? ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              defaultValue={client.phone ?? ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="+1 809 555 1234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cedula (National ID)
            </label>
            <input
              name="cedula"
              defaultValue={client.cedula ?? ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000-0000000-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RNC (Business Tax ID)
            </label>
            <input
              name="rnc"
              defaultValue={client.rnc ?? ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={client.status}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={client.notes ?? ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Additional notes..."
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
          <Link
            href={`/dashboard/clients/${client.id}`}
            className="flex-1 px-4 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 px-4 py-3 min-h-[44px] bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition font-medium"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
