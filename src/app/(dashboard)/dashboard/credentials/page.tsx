/**
 * Credentials Management Page
 * SOC 2: All decrypt operations are logged to AuditLog.
 * UX: Brand-aligned layout, clear hierarchy, client filter, empty state with CTA.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CredentialList } from "./CredentialList";

/**
 * Credentials page: per-client support credentials with optional client filter.
 */
export default async function CredentialsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const params = await searchParams;
  const clientId = params.clientId;

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
  const totalCredentials = filteredClients.reduce(
    (sum, c) => sum + c.supportCredentials.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header: title, description, CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B132B] tracking-tight">
            Support Credentials
          </h1>
          <p className="mt-1 text-sm text-[#8A8F98]">
            Client access credentials. Decrypt only when needed for active support.
          </p>
        </div>
        <Link
          href="/dashboard/clients"
          className="w-full sm:w-auto px-5 py-2.5 bg-[#1C6ED5] text-white rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all duration-200 text-center"
        >
          Add from client
        </Link>
      </div>

      {/* SOC 2 notice: compact, brand-aligned (navy border, not generic yellow) */}
      <div
        className="flex items-start gap-3 rounded-xl border border-[#0B132B]/15 bg-[#0B132B]/[0.03] p-4"
        role="alert"
        aria-label="SOC 2 compliance notice"
      >
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#1C6ED5]/10 text-[#1C6ED5]"
          aria-hidden
        >
          <LockIcon />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#0B132B]">SOC 2 Notice</p>
          <p className="mt-0.5 text-sm text-[#8A8F98]">
            All credential access is logged. Only decrypt when necessary for active support work.
          </p>
        </div>
      </div>

      {filteredClients.length > 0 ? (
        <>
          {/* Optional: show filter context when viewing one client */}
          {clientId && (
            <Link
              href="/dashboard/credentials"
              className="text-sm text-[#1C6ED5] hover:underline"
            >
              ← View all credentials
            </Link>
          )}

          <div className="space-y-6">
            {filteredClients.map((client) => (
              <section
                key={client.id}
                className="dashboard-card overflow-hidden"
                aria-labelledby={`client-${client.id}-title`}
              >
                {/* Client header: navy bar for consistency with other dashboard tables */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B132B] px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <h2
                      id={`client-${client.id}-title`}
                      className="text-base font-semibold text-white"
                    >
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="hover:text-[#1C6ED5]/90 transition-colors"
                      >
                        {client.company || client.name}
                      </Link>
                    </h2>
                    {client.company && (
                      <p className="text-sm text-white/70 mt-0.5">{client.name}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                    {client.supportCredentials.length} credential
                    {client.supportCredentials.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="p-5">
                  <CredentialList
                    clientId={client.id}
                    credentials={client.supportCredentials}
                  />
                </div>
              </section>
            ))}
          </div>

          {/* Summary for many clients */}
          {filteredClients.length > 1 && (
            <p className="text-center text-sm text-[#8A8F98]">
              {totalCredentials} credential{totalCredentials !== 1 ? "s" : ""} across{" "}
              {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""}
            </p>
          )}
        </>
      ) : (
        <EmptyState hasClientFilter={!!clientId} />
      )}
    </div>
  );
}

/**
 * Empty state: icon, message, CTA to add credentials via client page.
 */
function EmptyState({ hasClientFilter }: { hasClientFilter: boolean }) {
  return (
    <div className="dashboard-card flex flex-col items-center justify-center px-6 py-16 text-center">
      <span
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B132B]/10 text-[#8A8F98]"
        aria-hidden
      >
        <KeyIcon />
      </span>
      <h2 className="text-lg font-semibold text-[#0B132B]">No credentials yet</h2>
      <p className="mt-2 max-w-sm text-sm text-[#8A8F98]">
        {hasClientFilter
          ? "This client has no support credentials. Add them from the client detail page."
          : "Add support credentials from a client's detail page."}
      </p>
      <Link
        href={hasClientFilter ? "/dashboard/credentials" : "/dashboard/clients"}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1C6ED5] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1559B3] transition-colors"
      >
        {hasClientFilter ? "View all credentials" : "Go to clients"}
      </Link>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}
