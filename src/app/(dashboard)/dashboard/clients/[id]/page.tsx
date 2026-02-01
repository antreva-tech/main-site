/**
 * Client Detail Page
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClientContact, deleteClientContact, updateClientContact, updateClient, createSubscription, updateSubscription, deleteSubscription } from "../actions";
import { createCredential, updateCredential, deleteCredential } from "@/app/(dashboard)/dashboard/credentials/actions";
import { createTicket } from "@/app/(dashboard)/dashboard/tickets/actions";
import { ClientSubscriptions } from "./ClientSubscriptions";
import { ClientCredentials } from "./ClientCredentials";
import { ClientContacts } from "./ClientContacts";
import { EditClientDetailsModal } from "./EditClientDetailsModal";

/** Shape of client query result for this page (avoids stale Prisma client types). */
interface ClientWithRelations {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  websiteUrl: string | null;
  cedula: string | null;
  rnc: string | null;
  notes: string | null;
  status: string;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  leadId: string | null;
  contacts: Array<{ id: string; name: string; title: string | null; email: string | null; phone: string | null }>;
  subscriptions: Array<{
    id: string;
    serviceId: string;
    service: { id: string; name: string };
    amount: unknown;
    currency: string;
    billingCycle: string;
    startDate: Date;
    endDate: Date | null;
    status: string;
  }>;
  tickets: Array<{ id: string; subject: string; status: string; priority: string; createdAt: Date }>;
  lead: { id: string; source: string } | null;
  supportCredentials: Array<{ id: string; label: string }>;
  _count: { supportCredentials: number };
}

/**
 * Client detail page with subscriptions and tickets.
 */
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [clientRaw, services] = await Promise.all([
    prisma.client.findUnique({
      where: { id },
      include: {
        contacts: { orderBy: { createdAt: "asc" } },
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
        supportCredentials: {
          orderBy: { label: "asc" },
          select: { id: true, label: true },
        },
        _count: {
          select: { supportCredentials: true },
        },
      },
    } as { where: { id: string }; include: Record<string, unknown> }),
    prisma.service.findMany({
      where: { isActive: true, slug: { in: ["start", "pro", "premium"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, defaultAmount: true, currency: true },
    }),
  ]);

  const client = clientRaw as ClientWithRelations | null;

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

      {/* Header: business name large, CEO name small */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {client.company || client.name}
            </h1>
            {client.company && (
              <p className="text-gray-600 text-sm mt-1">{client.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={client.status} />
          </div>
        </div>

        {/* Contact Info - mobile-first: 1 col → 2 → 4; min-w-0 + truncate prevent overflow */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 uppercase">Email</p>
            <a
              href={`mailto:${client.email}`}
              title={client.email}
              className="text-[#1C6ED5] hover:underline text-sm block truncate"
            >
              {client.email}
            </a>
          </div>
          {client.phone && (
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">Phone</p>
              <a
                href={`tel:${client.phone}`}
                title={client.phone}
                className="text-[#1C6ED5] hover:underline text-sm block truncate"
              >
                {client.phone}
              </a>
            </div>
          )}
          {client.websiteUrl && (
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">Website</p>
              <a
                href={client.websiteUrl.startsWith("http") ? client.websiteUrl : `https://${client.websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                title={client.websiteUrl}
                className="text-[#1C6ED5] hover:underline text-sm block truncate"
              >
                {client.websiteUrl.replace(/^https?:\/\//i, "")}
              </a>
            </div>
          )}
          {client.cedula && (
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">Cedula</p>
              <p className="text-sm truncate" title="Full number hidden for privacy">
                {maskCedula(client.cedula)}
              </p>
            </div>
          )}
          {client.rnc && (
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">RNC</p>
              <p className="text-sm truncate" title={client.rnc}>{client.rnc}</p>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-gray-500 uppercase">Started</p>
            <p className="text-sm">{client.startedAt.toLocaleDateString()}</p>
          </div>
          {client.lead && (
            <div className="min-w-0">
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

        {/* Quick Actions - stack on mobile, touch-friendly min height */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/dashboard/credentials?clientId=${client.id}`}
            className="min-h-[44px] flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm w-full sm:w-auto"
          >
            View Credentials ({client._count.supportCredentials})
          </Link>
          <Link
            href={`/dashboard/tickets?clientId=${client.id}`}
            className="min-h-[44px] flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm w-full sm:w-auto"
          >
            View All Tickets
          </Link>
        </div>

        {/* Edit client details (opens modal) */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <EditClientDetailsModal
            client={{
              id: client.id,
              name: client.name,
              email: client.email,
              company: client.company,
              phone: client.phone,
              websiteUrl: client.websiteUrl,
              cedula: client.cedula,
              rnc: client.rnc,
              notes: client.notes,
              status: client.status,
            }}
            updateClient={updateClient}
          />
        </div>
      </div>

      {/* Admin credentials */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin credentials</h2>
        <p className="text-sm text-gray-500 mb-4">
          Store client admin panel / cPanel / FTP credentials. Values are encrypted. Decrypt from Support Credentials when needed.
        </p>
        {client.supportCredentials.length > 0 ? (
          <ClientCredentials
            credentials={client.supportCredentials.map((c) => ({ id: c.id, label: c.label }))}
            clientId={client.id}
            updateCredential={updateCredential}
            deleteCredential={deleteCredential}
          />
        ) : (
          <p className="text-gray-500 text-sm mb-4">No credentials yet.</p>
        )}
        <form action={createCredential} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <input type="hidden" name="clientId" value={client.id} />
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Label *</label>
            <input
              name="label"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="e.g. Admin panel, cPanel"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Value (password / URL) *</label>
            <input
              type="password"
              name="value"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Encrypted at rest"
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] sm:col-span-2 px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
          >
            Add credential
          </button>
        </form>
      </div>

      {/* Contacts */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacts</h2>
        {client.contacts.length > 0 ? (
          <ClientContacts
            contacts={client.contacts}
            clientId={client.id}
            updateClientContact={updateClientContact}
            deleteClientContact={deleteClientContact}
          />
        ) : (
          <p className="text-gray-500 text-sm mb-4">No additional contacts yet.</p>
        )}
        <form
          action={createClientContact}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg"
        >
          <input type="hidden" name="clientId" value={client.id} />
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Name *
            </label>
            <input
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Contact name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Title
            </label>
            <input
              name="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="e.g. Admin"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="email@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="+1 809..."
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] sm:col-span-2 w-full sm:w-auto px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
          >
            Add Contact
          </button>
        </form>
      </div>

      {/* Subscriptions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Subscriptions</h2>
        </div>

        {/* Add subscription form */}
        {services.length === 0 && (
          <p className="text-sm text-gray-500 mb-4">
            No active services in the catalog. Add services in Settings to offer subscriptions.
          </p>
        )}
        {services.length > 0 && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm font-medium text-[#1C6ED5] hover:underline list-none">
              + Add Subscription
            </summary>
            <form action={createSubscription} className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="hidden" name="clientId" value={client.id} />
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Service *</label>
                <select
                  name="serviceId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                >
                  <option value="">Select service</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name}
                      {Number(svc.defaultAmount) > 0
                        ? ` — ${svc.currency === "DOP" ? "RD$" : "$"}${Number(svc.defaultAmount).toLocaleString()}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Currency</label>
                <select
                  name="currency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                >
                  <option value="DOP">DOP (RD$)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Billing cycle</label>
                <select
                  name="billingCycle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="one_time">One-time</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Start date *</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
                >
                  Add subscription
                </button>
              </div>
            </form>
          </details>
        )}

        {client.subscriptions.length > 0 ? (
          <ClientSubscriptions
            subscriptions={client.subscriptions.map((sub) => ({
              id: sub.id,
              serviceId: sub.serviceId,
              service: { id: sub.service.id, name: sub.service.name },
              amount: Number(sub.amount),
              currency: sub.currency,
              billingCycle: sub.billingCycle,
              startDate: sub.startDate.toISOString(),
              endDate: sub.endDate ? sub.endDate.toISOString() : null,
              status: sub.status,
            }))}
            clientId={client.id}
            services={services.map((s) => ({ id: s.id, name: s.name }))}
            updateSubscription={updateSubscription}
            deleteSubscription={deleteSubscription}
          />
        ) : (
          <p className="text-gray-500 text-sm py-4 text-center">
            No subscriptions yet
          </p>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
          <Link
            href={`/dashboard/tickets?clientId=${client.id}`}
            className="text-sm text-[#1C6ED5] hover:underline"
          >
            View All
          </Link>
        </div>

        {/* Create ticket for this client */}
        <form action={createTicket} className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">Create support ticket</p>
          <input type="hidden" name="clientId" value={client.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 uppercase mb-1">Subject *</label>
              <input
                name="subject"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Priority</label>
              <select
                name="priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5] min-h-[44px]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 uppercase mb-1">Initial message (optional)</label>
            <textarea
              name="content"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Add details..."
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
          >
            Create ticket
          </button>
        </form>

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
 * Masks Cedula for display: only last 4 characters visible (e.g. ••••••••••••8901).
 */
function maskCedula(cedula: string): string {
  if (cedula.length <= 4) return cedula;
  const last4 = cedula.slice(-4);
  return "•".repeat(cedula.length - 4) + last4;
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
