/**
 * Client Detail Page
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * Client detail page with subscriptions and tickets.
 */
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      subscriptions: {
        include: { service: true },
        orderBy: { startDate: "desc" },
      },
      tickets: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      },
      lead: {
        select: { id: true, source: true },
      },
      _count: {
        select: { supportCredentials: true },
      },
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/dashboard/clients"
          className="text-[#1C6ED5] hover:underline text-sm"
        >
          ← Back to Clients
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.company && (
              <p className="text-gray-600 mt-1">{client.company}</p>
            )}
          </div>
          <StatusBadge status={client.status} />
        </div>

        {/* Contact Info */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Email</p>
            <a
              href={`mailto:${client.email}`}
              className="text-[#1C6ED5] hover:underline text-sm"
            >
              {client.email}
            </a>
          </div>
          {client.phone && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Phone</p>
              <a
                href={`tel:${client.phone}`}
                className="text-[#1C6ED5] hover:underline text-sm"
              >
                {client.phone}
              </a>
            </div>
          )}
          {client.cedula && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Cedula</p>
              <p className="text-sm">{client.cedula}</p>
            </div>
          )}
          {client.rnc && (
            <div>
              <p className="text-xs text-gray-500 uppercase">RNC</p>
              <p className="text-sm">{client.rnc}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase">Started</p>
            <p className="text-sm">{client.startedAt.toLocaleDateString()}</p>
          </div>
          {client.lead && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Source</p>
              <p className="text-sm capitalize">{client.lead.source.replace("_", " ")}</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {client.notes && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase mb-2">Notes</p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {client.notes}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
          <Link
            href={`/dashboard/credentials?clientId=${client.id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            View Credentials ({client._count.supportCredentials})
          </Link>
          <Link
            href={`/dashboard/tickets?clientId=${client.id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            View All Tickets
          </Link>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Subscriptions</h2>
          <button className="text-sm text-[#1C6ED5] hover:underline">
            + Add Subscription
          </button>
        </div>

        {client.subscriptions.length > 0 ? (
          <div className="space-y-3">
            {client.subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {sub.service.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {sub.billingCycle} · Started{" "}
                    {sub.startDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {sub.currency === "DOP" ? "RD$" : "$"}
                    {Number(sub.amount).toLocaleString()}
                  </p>
                  <SubscriptionStatus status={sub.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4 text-center">
            No subscriptions yet
          </p>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
          <Link
            href={`/dashboard/tickets?clientId=${client.id}`}
            className="text-sm text-[#1C6ED5] hover:underline"
          >
            View All
          </Link>
        </div>

        {client.tickets.length > 0 ? (
          <div className="space-y-2">
            {client.tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
              >
                <div>
                  <p className="font-medium text-gray-900">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">
                    {ticket.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <TicketStatus status={ticket.status} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4 text-center">
            No tickets yet
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-6 text-xs text-gray-400">
        <p>Created: {client.createdAt.toLocaleString()}</p>
        <p>Updated: {client.updatedAt.toLocaleString()}</p>
        <p>ID: {client.id}</p>
      </div>
    </div>
  );
}

/**
 * Status badge component.
 */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-yellow-100 text-yellow-700",
    churned: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.active}`}
    >
      {status}
    </span>
  );
}

/**
 * Subscription status badge.
 */
function SubscriptionStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "text-green-600",
    paused: "text-yellow-600",
    cancelled: "text-red-600",
    expired: "text-gray-500",
  };

  return (
    <span className={`text-xs font-medium ${styles[status] || styles.active}`}>
      {status}
    </span>
  );
}

/**
 * Ticket status badge.
 */
function TicketStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-purple-100 text-purple-700",
    waiting: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.open}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
