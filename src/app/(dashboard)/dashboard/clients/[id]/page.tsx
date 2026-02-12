/**
 * Client Detail Page
 * Uses locale from cookie for Spanish/English (section titles, form labels, status text).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createClientContact, deleteClientContact, updateClientContact, updateClient, createSubscription, updateSubscription, deleteSubscription, createSingleCharge, updateSingleCharge, deleteSingleCharge } from "../actions";
import { createCredential, updateCredential, deleteCredential } from "@/app/(dashboard)/dashboard/credentials/actions";
import { createTicket } from "@/app/(dashboard)/dashboard/tickets/actions";
import { ClientSubscriptions } from "./ClientSubscriptions";
import { ClientSingleCharges } from "./ClientSingleCharges";
import { AddSingleChargeForm } from "./AddSingleChargeForm";
import { ClientCredentials } from "./ClientCredentials";
import { ClientContacts } from "./ClientContacts";
import { AddCredentialForm } from "./AddCredentialForm";
import { AddContactForm } from "./AddContactForm";
import { AddTicketForm } from "./AddTicketForm";
import { EditClientDetailsModal } from "./EditClientDetailsModal";
import { StartDevelopmentProjectButton } from "./StartDevelopmentProjectButton";
import { getTranslations } from "@/i18n";
import type { Translations } from "@/i18n";

const LOCALE_COOKIE = "locale";

/** Shape of client query result for this page (avoids stale Prisma client types). */
interface ClientWithRelations {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  lineOfBusiness: string | null;
  websiteUrl: string | null;
  adminPortalUrl: string | null;
  showOnWebsite: boolean;
  logoUrl: string | null;
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
  singleCharges: Array<{
    id: string;
    description: string;
    amount: unknown;
    currency: string;
    chargedAt: Date;
    status: string;
    notes: string | null;
  }>;
  tickets: Array<{ id: string; subject: string; status: string; priority: string; createdAt: Date }>;
  lead: { id: string; source: string; referralFrom: string | null } | null;
  supportCredentials: Array<{ id: string; label: string }>;
  developmentProject: { id: string; stage: string } | null;
  _count: { supportCredentials: number; subscriptions: number; singleCharges: number; tickets: number };
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

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeCookie === "en" || localeCookie === "es" ? localeCookie : "es";
  const t = getTranslations(locale);

  const [session, clientRaw, services] = await Promise.all([
    getSession(),
    prisma.client.findUnique({
      where: { id },
      include: {
        contacts: { orderBy: { createdAt: "asc" } },
        subscriptions: {
          include: { service: true },
          orderBy: { startDate: "desc" },
        },
        singleCharges: {
          orderBy: { chargedAt: "desc" },
          select: {
            id: true,
            description: true,
            amount: true,
            currency: true,
            chargedAt: true,
            status: true,
            notes: true,
          },
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
          select: { id: true, source: true, referralFrom: true },
        },
        supportCredentials: {
          orderBy: { label: "asc" },
          select: { id: true, label: true },
        },
        developmentProject: {
          select: { id: true, stage: true },
        },
        _count: {
          select: { supportCredentials: true, subscriptions: true, singleCharges: true, tickets: true },
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
    <div className="w-full">
      {/* Breadcrumb: minimal, brand link — touch-friendly on mobile */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1C6ED5] hover:text-[#1559B3] transition-colors min-h-[44px] py-2 -my-2 touch-manipulation"
        >
          <span aria-hidden>←</span> Back to Clients
        </Link>
      </div>

      {/* Hero: mobile-first — single column; lg: 2 cols with At a glance right panel */}
      <div className="dashboard-card overflow-hidden mb-6">
        <div className="bg-gradient-to-br from-[#0B132B]/[0.03] via-transparent to-[#1C6ED5]/[0.04] dark:from-white/[0.02] dark:via-transparent dark:to-[#1C6ED5]/[0.06] p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: main client info — full width on mobile */}
            <div className="min-w-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  {client.logoUrl && (
                    <img
                      src={client.logoUrl}
                      alt=""
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-[#0B132B]/[0.08] dark:border-white/15 object-cover flex-shrink-0 bg-white dark:bg-gray-700"
                      width={48}
                      height={48}
                    />
                  )}
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#0B132B] dark:text-gray-100 tracking-tight truncate">
                      {client.company || client.name}
                    </h1>
                    {client.company && (
                      <p className="text-[#8A8F98] dark:text-gray-400 text-sm mt-1.5 font-medium truncate">
                        {client.name}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={client.status} t={t} />
              </div>

              {/* Project status — card-style UI; pipeline link only for CTO and Developer */}
              {(() => {
                const canViewPipeline =
                  session?.title === "CTO" ||
                  session?.title === "Developer" ||
                  session?.roleName?.toLowerCase() === "developer";
                return (
                  <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[#0B132B]/[0.08] dark:border-white/10">
                    <div className="rounded-xl border border-[#0B132B]/[0.08] dark:border-white/10 bg-white/60 dark:bg-white/[0.06] p-4">
                      <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-3">
                        Project status
                      </p>
                      {client.developmentProject ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm ${getProjectStageStyles(client.developmentProject.stage)}`}
                          >
                            {formatDevStage(client.developmentProject.stage, t)}
                          </span>
                          {canViewPipeline && (
                            <Link
                              href={`/dashboard/development/${client.developmentProject.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#1C6ED5] dark:text-[#7eb8ff] hover:text-[#1559B3] dark:hover:text-[#9ec9ff] rounded-lg hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-[#1C6ED5]/20 transition-colors"
                            >
                              {t.dashboard.nav.development}
                              <span aria-hidden>→</span>
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm text-[#8A8F98] dark:text-gray-400">{(t.dashboard as { development: { noActiveProject: string } }).development.noActiveProject}</span>
                          {canViewPipeline && (
                            <StartDevelopmentProjectButton clientId={client.id} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Contact grid: 1 col mobile → 2 → 4 on larger */}
              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
              <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.clients.email}</p>
              <a
                href={`mailto:${client.email}`}
                title={client.email}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg border border-[#1C6ED5]/30 dark:border-[#1C6ED5]/40 bg-[#1C6ED5]/[0.08] dark:bg-[#1C6ED5]/20 text-[#1C6ED5] dark:text-[#7eb8ff] hover:bg-[#1C6ED5]/15 dark:hover:bg-[#1C6ED5]/30 hover:border-[#1C6ED5]/50 transition-all"
              >
                <span aria-hidden>✉️</span> {t.dashboard.clients.email}
              </a>
            </div>
            {client.phone && (
              <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
                <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.clients.phone}</p>
                <div className="flex flex-wrap gap-1.5">
                  <a
                    href={`tel:${client.phone}`}
                    title={client.phone}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg border border-violet-500/30 dark:border-violet-400/40 bg-violet-500/[0.08] dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15 dark:hover:bg-violet-500/30 hover:border-violet-500/50 transition-all"
                  >
                    <span aria-hidden>📞</span> Call
                  </a>
                  <a
                    href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`WhatsApp ${client.phone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg border border-[#25D366]/40 dark:border-[#25D366]/50 bg-[#25D366]/[0.12] dark:bg-[#25D366]/25 text-[#128C7E] dark:text-[#5cdb9a] hover:bg-[#25D366]/20 dark:hover:bg-[#25D366]/35 hover:border-[#25D366]/60 transition-all"
                  >
                    <span aria-hidden>💬</span> WhatsApp
                  </a>
                </div>
              </div>
            )}
            {client.websiteUrl && (
              <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
                <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.clients.website}</p>
                <a
                  href={client.websiteUrl.startsWith("http") ? client.websiteUrl : `https://${client.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={client.websiteUrl}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg border border-[#1C6ED5]/30 dark:border-[#1C6ED5]/40 bg-[#1C6ED5]/[0.08] dark:bg-[#1C6ED5]/20 text-[#1C6ED5] dark:text-[#7eb8ff] hover:bg-[#1C6ED5]/15 dark:hover:bg-[#1C6ED5]/30 hover:border-[#1C6ED5]/50 transition-all"
                >
                  <span aria-hidden>↗</span> {t.dashboard.clients.openWebsite}
                </a>
              </div>
            )}
            {client.adminPortalUrl && (
              <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
                <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.clients.adminPortal}</p>
                <a
                  href={client.adminPortalUrl.startsWith("http") ? client.adminPortalUrl : `https://${client.adminPortalUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={client.adminPortalUrl}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg border border-[#1C6ED5]/30 dark:border-[#1C6ED5]/40 bg-[#1C6ED5]/[0.08] dark:bg-[#1C6ED5]/20 text-[#1C6ED5] dark:text-[#7eb8ff] hover:bg-[#1C6ED5]/15 dark:hover:bg-[#1C6ED5]/30 hover:border-[#1C6ED5]/50 transition-all"
                >
                  <span aria-hidden>↗</span> {t.dashboard.clients.openAdminPortal}
                </a>
              </div>
            )}
            {client.cedula && (
              <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
                <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.clients.cedula}</p>
                <p className="text-sm text-[#0B132B]/90 dark:text-gray-200 truncate font-mono" title={t.dashboard.clients.fullNumberHidden}>
                  {maskCedula(client.cedula)}
                </p>
              </div>
            )}
            {client.rnc && (
              <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
                <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.clients.rnc}</p>
                <p className="text-sm text-[#0B132B]/90 dark:text-gray-200 truncate font-mono" title={client.rnc}>{client.rnc}</p>
              </div>
            )}
            <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
              <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.clients.started}</p>
              <p className="text-sm text-[#0B132B]/90 dark:text-gray-200">{client.startedAt.toLocaleDateString()}</p>
            </div>
            {client.lead && (
              <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
                <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.clients.source}</p>
                <p className="text-sm text-[#0B132B]/90 dark:text-gray-200 capitalize">{client.lead.source.replace("_", " ")}</p>
                {client.lead.source === "referral" && client.lead.referralFrom && (
                  <p className="text-sm text-[#0B132B]/80 dark:text-gray-300 mt-1">Referral from: {client.lead.referralFrom}</p>
                )}
              </div>
            )}
            <div className="min-w-0 p-3 rounded-lg bg-white/60 dark:bg-white/[0.06] border border-[#0B132B]/[0.06] dark:border-white/10">
              <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1">{t.dashboard.common.lineOfBusiness}</p>
              <p className="text-sm text-[#0B132B]/90 dark:text-gray-200">{client.lineOfBusiness ? (t.dashboard.common.lineOfBusinessOptions as Record<string, string>)[client.lineOfBusiness] ?? client.lineOfBusiness.replace(/_/g, " ") : "—"}</p>
            </div>
              </div>

              {/* Notes */}
              {client.notes && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#0B132B]/[0.08] dark:border-white/10">
                  <p className="text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-2">{t.dashboard.clients.notes}</p>
                  <p className="text-[#0B132B]/85 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                    {client.notes}
                  </p>
                </div>
              )}

              {/* Quick Actions — mobile / single column only; on lg shown in right panel */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#0B132B]/[0.08] dark:border-white/10 flex flex-col sm:flex-row gap-3 lg:hidden">
                <Link
                  href={`/dashboard/credentials?clientId=${client.id}`}
                  className="min-h-[44px] flex items-center justify-center px-4 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-xl hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-[#1C6ED5]/20 hover:border-[#1C6ED5]/30 text-sm font-medium text-[#0B132B] dark:text-gray-100 transition-all w-full sm:w-auto touch-manipulation"
                >
                  {t.dashboard.clients.viewCredentials} ({client._count.supportCredentials})
                </Link>
                <Link
                  href={`/dashboard/tickets?clientId=${client.id}`}
                  className="min-h-[44px] flex items-center justify-center px-4 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-xl hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-[#1C6ED5]/20 hover:border-[#1C6ED5]/30 text-sm font-medium text-[#0B132B] dark:text-gray-100 transition-all w-full sm:w-auto touch-manipulation"
                >
                  {t.dashboard.clients.viewAllTickets}
                </Link>
              </div>

              {/* Edit client details */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#0B132B]/[0.08] dark:border-white/10">
                <EditClientDetailsModal
                  client={{
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    company: client.company,
                    phone: client.phone,
                    lineOfBusiness: client.lineOfBusiness,
                    websiteUrl: client.websiteUrl,
                    adminPortalUrl: client.adminPortalUrl,
                    showOnWebsite: client.showOnWebsite,
                    logoUrl: client.logoUrl,
                    cedula: client.cedula,
                    rnc: client.rnc,
                    notes: client.notes,
                    status: client.status,
                  }}
                  updateClient={updateClient}
                />
              </div>
            </div>

            {/* Right: At a glance — visible on lg+ only; fills empty space dynamically */}
            <aside className="hidden lg:flex flex-col gap-4 min-w-0">
              <div className="rounded-xl border border-[#0B132B]/[0.08] dark:border-white/10 bg-white/50 dark:bg-white/[0.06] p-5 flex-shrink-0">
                <h2 className="text-sm font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-4">
                  {t.dashboard.atAGlance}
                </h2>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <dt className="text-sm text-[#0B132B]/80 dark:text-gray-400">{t.dashboard.clients.subscriptions}</dt>
                    <dd className="text-sm font-semibold text-[#0B132B] dark:text-gray-100">{client._count.subscriptions}</dd>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <dt className="text-sm text-[#0B132B]/80 dark:text-gray-400">{t.dashboard.clients.singleCharges}</dt>
                    <dd className="text-sm font-semibold text-[#0B132B] dark:text-gray-100">{client._count.singleCharges}</dd>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <dt className="text-sm text-[#0B132B]/80 dark:text-gray-400">{t.dashboard.nav.tickets}</dt>
                    <dd className="text-sm font-semibold text-[#0B132B] dark:text-gray-100">{client._count.tickets}</dd>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <dt className="text-sm text-[#0B132B]/80 dark:text-gray-400">{t.dashboard.clients.adminCredentials}</dt>
                    <dd className="text-sm font-semibold text-[#0B132B] dark:text-gray-100">{client._count.supportCredentials}</dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col gap-3 flex-1 min-h-0">
                <Link
                  href={`/dashboard/credentials?clientId=${client.id}`}
                  className="min-h-[44px] flex items-center justify-center px-4 py-2.5 bg-[#1C6ED5] text-white rounded-xl font-medium text-sm hover:bg-[#1559B3] transition-colors shadow-sm touch-manipulation"
                >
                  {t.dashboard.clients.viewCredentials} ({client._count.supportCredentials})
                </Link>
                <Link
                  href={`/dashboard/tickets?clientId=${client.id}`}
                  className="min-h-[44px] flex items-center justify-center px-4 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-xl font-medium text-sm text-[#0B132B] dark:text-gray-100 hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-[#1C6ED5]/20 hover:border-[#1C6ED5]/30 transition-colors touch-manipulation"
                >
                  {t.dashboard.clients.viewAllTickets}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* 1 col mobile → 2 col md → 3 col xl; hero stays full width above */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
      {/* Contacts */}
      <div className="dashboard-card p-5 sm:p-6">
        <h2 className="dashboard-section-title text-lg mb-1">{t.dashboard.clients.contacts}</h2>
        {client.contacts.length > 0 ? (
          <ClientContacts
            contacts={client.contacts}
            clientId={client.id}
            updateClientContact={updateClientContact}
            deleteClientContact={deleteClientContact}
          />
        ) : (
          <p className="text-[#8A8F98] text-sm mb-5">{t.dashboard.clients.noContactsYet}</p>
        )}
        <AddContactForm clientId={client.id} createClientContact={createClientContact} />
      </div>

      {/* Subscriptions */}
      <div className="dashboard-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="dashboard-section-title text-lg">{t.dashboard.clients.subscriptions}</h2>
        </div>

        {/* Add subscription form */}
        {services.length === 0 && (
          <p className="text-sm text-[#8A8F98] mb-5">
            {t.dashboard.clients.noActiveServices}
          </p>
        )}
        {services.length > 0 && (
          <details className="mb-6 group">
            <summary className="cursor-pointer text-sm font-semibold text-[#1C6ED5] hover:text-[#1559B3] list-none py-1 transition-colors">
              + {t.dashboard.clients.addSubscription}
            </summary>
            <form action={createSubscription} className="mt-4 p-4 sm:p-5 rounded-xl bg-[#0B132B]/[0.03] dark:bg-white/[0.04] border border-[#0B132B]/[0.06] dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="hidden" name="clientId" value={client.id} />
              <div>
                <label className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5">{t.dashboard.clients.service}</label>
                <select
                  name="serviceId"
                  required
                  className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 dark:bg-white/5 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
                >
                  <option value="">{t.dashboard.clients.selectService}</option>
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
                <label className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5">{t.dashboard.clients.amount}</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 dark:bg-white/5 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5">{t.dashboard.clients.currency}</label>
                <select
                  name="currency"
                  className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 dark:bg-white/5 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
                >
                  <option value="DOP">DOP (RD$)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5">{t.dashboard.clients.billingCycle}</label>
                <select
                  name="billingCycle"
                  className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 dark:bg-white/5 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
                >
                  <option value="monthly">{t.dashboard.clients.monthly}</option>
                  <option value="quarterly">{t.dashboard.clients.quarterly}</option>
                  <option value="annual">{t.dashboard.clients.annual}</option>
                  <option value="one_time">{t.dashboard.clients.oneTime}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5">{t.dashboard.clients.startDate}</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full px-3 py-2.5 border border-[#0B132B]/[0.12] dark:border-white/20 rounded-lg text-sm text-[#0B132B] dark:text-gray-100 dark:bg-white/5 focus:ring-2 focus:ring-[#1C6ED5]/40 focus:border-[#1C6ED5] transition-colors"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="min-h-[44px] w-full sm:w-auto px-4 py-2.5 bg-[#1C6ED5] text-white text-sm rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all"
                >
                  {t.dashboard.clients.addSubscriptionSubmit}
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
          <p className="text-[#8A8F98] text-sm py-6 text-center">
            {t.dashboard.clients.noSubscriptionsYet}
          </p>
        )}
      </div>

      {/* Single charges */}
      <div className="dashboard-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="dashboard-section-title text-lg">{t.dashboard.clients.singleCharges}</h2>
        </div>
        <p className="text-sm text-[#8A8F98] mb-5">
          {t.dashboard.clients.singleChargesHint}
        </p>
        <div className="mb-5">
          <AddSingleChargeForm clientId={client.id} createSingleCharge={createSingleCharge} />
        </div>
        {client.singleCharges.length > 0 ? (
          <ClientSingleCharges
            charges={client.singleCharges.map((c) => ({
              id: c.id,
              description: c.description,
              amount: c.amount,
              currency: c.currency,
              chargedAt: c.chargedAt,
              status: c.status,
              notes: c.notes,
            }))}
            clientId={client.id}
            updateSingleCharge={updateSingleCharge}
            deleteSingleCharge={deleteSingleCharge}
          />
        ) : (
          <p className="text-[#8A8F98] text-sm py-6 text-center">
            {t.dashboard.clients.noSingleChargesYet}
          </p>
        )}
      </div>

      {/* Admin credentials */}
      <div className="dashboard-card p-5 sm:p-6">
        <h2 className="dashboard-section-title text-lg mb-1">{t.dashboard.clients.adminCredentials}</h2>
        <p className="text-sm text-[#8A8F98] mb-5">
          {t.dashboard.clients.adminCredentialsHint}
        </p>
        {client.supportCredentials.length > 0 ? (
          <ClientCredentials
            credentials={client.supportCredentials.map((c) => ({ id: c.id, label: c.label }))}
            clientId={client.id}
            updateCredential={updateCredential}
            deleteCredential={deleteCredential}
          />
        ) : (
          <p className="text-[#8A8F98] text-sm mb-4">{t.dashboard.clients.noCredentialsYet}</p>
        )}
        <AddCredentialForm clientId={client.id} createCredential={createCredential} />
      </div>

      {/* Recent Tickets */}
      <div className="dashboard-card p-5 sm:p-6 lg:min-h-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="dashboard-section-title text-lg">{t.dashboard.clients.recentTickets}</h2>
          <Link
            href={`/dashboard/tickets?clientId=${client.id}`}
            className="text-sm font-semibold text-[#1C6ED5] hover:text-[#1559B3] transition-colors"
          >
            {t.dashboard.clients.viewAll}
          </Link>
        </div>

        <AddTicketForm clientId={client.id} createTicket={createTicket} />

        {client.tickets.length > 0 ? (
          <div className="space-y-2">
            {client.tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#0B132B]/[0.06] dark:border-white/10 hover:bg-[#1C6ED5]/[0.05] dark:hover:bg-[#1C6ED5]/15 hover:border-[#1C6ED5]/20 transition-all"
              >
                <div>
                  <p className="font-semibold text-[#0B132B] dark:text-gray-100">{ticket.subject}</p>
                  <p className="text-xs text-[#8A8F98] dark:text-gray-400 mt-0.5">
                    {ticket.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <TicketStatus status={ticket.status} t={t} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[#8A8F98] dark:text-gray-400 text-sm py-6 text-center">
            {t.dashboard.clients.noTicketsYet}
          </p>
        )}
      </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 text-xs text-[#8A8F98]/80 dark:text-gray-500">
        <p>{t.dashboard.clients.created}: {client.createdAt.toLocaleString()}</p>
        <p>{t.dashboard.clients.updated}: {client.updatedAt.toLocaleString()}</p>
        <p>ID: {client.id}</p>
      </div>
    </div>
  );
}

/**
 * Human-readable development stage label using i18n.
 */
function formatDevStage(stage: string, t: Translations): string {
  const dev = (t.dashboard as { development?: Record<string, string> }).development;
  return dev?.[stage] ?? stage;
}

/**
 * Tailwind classes for project stage pill (bg + text) for color-coding; includes dark mode.
 */
function getProjectStageStyles(stage: string): string {
  const styles: Record<string, string> = {
    discovery: "bg-blue-500/12 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300",
    design: "bg-violet-500/12 text-violet-700 dark:bg-violet-500/25 dark:text-violet-300",
    development: "bg-[#1C6ED5]/12 text-[#1C6ED5] dark:bg-[#1C6ED5]/25 dark:text-[#7eb8ff]",
    qa: "bg-amber-500/12 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300",
    deployment: "bg-teal-500/12 text-teal-700 dark:bg-teal-500/25 dark:text-teal-300",
    completed: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300",
    on_hold: "bg-[#8A8F98]/20 text-[#8A8F98] dark:bg-white/15 dark:text-gray-400",
  };
  return styles[stage] ?? "bg-[#0B132B]/10 text-[#0B132B]/80 dark:bg-white/10 dark:text-gray-300";
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
 * Status badge component; label from i18n. Includes dark mode variants.
 */
function StatusBadge({ status, t }: { status: string; t: Translations }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300",
    inactive: "bg-amber-500/12 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300",
    churned: "bg-red-500/12 text-red-700 dark:bg-red-500/25 dark:text-red-300",
  };
  const label = status === "active" ? t.dashboard.clients.active : status === "inactive" ? t.dashboard.clients.inactive : status === "churned" ? t.dashboard.clients.churned : status;

  return (
    <span
      className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${styles[status] || styles.active}`}
    >
      {label}
    </span>
  );
}

/**
 * Ticket status badge; label from i18n. Includes dark mode variants.
 */
function TicketStatus({ status, t }: { status: string; t: Translations }) {
  const styles: Record<string, string> = {
    open: "bg-[#1C6ED5]/12 text-[#1C6ED5] dark:bg-[#1C6ED5]/25 dark:text-[#7eb8ff]",
    in_progress: "bg-purple-500/12 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300",
    waiting: "bg-amber-500/12 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300",
    resolved: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300",
    closed: "bg-[#8A8F98]/20 text-[#8A8F98] dark:bg-white/15 dark:text-gray-400",
  };
  const statuses = t.dashboard.tickets.statuses as Record<string, string>;
  const label = statuses[status] ?? status.replace("_", " ");

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.open}`}
    >
      {label}
    </span>
  );
}
