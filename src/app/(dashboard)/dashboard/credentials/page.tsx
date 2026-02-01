/**
 * Credentials Management Page
 * SOC 2: All decrypt operations are logged to AuditLog.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CredentialList } from "./CredentialList";

/**
 * Credentials page showing per-client credentials.
 */
export default async function CredentialsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const params = await searchParams;
  const clientId = params.clientId;

  // Get clients with credentials
  const clients = await prisma.client.findMany({
    where: clientId ? { id: clientId } : undefined,
    orderBy: [{ company: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      company: true,
      supportCredentials: {
        orderBy: { label: "asc" },
        select: {
          id: true,
          label: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  const filteredClients = clients.filter((c) => c.supportCredentials.length > 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Credentials</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>SOC 2 Notice:</strong> All credential access is logged. Only
          decrypt when necessary for active support work.
        </p>
      </div>

      {filteredClients.length > 0 ? (
        <div className="space-y-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="hover:text-[#1C6ED5]"
                    >
                      {client.company || client.name}
                    </Link>
                  </h2>
                  {client.company && (
                    <p className="text-sm text-gray-500 mt-0.5">{client.name}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {client.supportCredentials.length} credential(s)
                </span>
              </div>

              <CredentialList
                clientId={client.id}
                credentials={client.supportCredentials}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No credentials stored yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Add credentials from a client&apos;s detail page.
          </p>
        </div>
      )}
    </div>
  );
}
