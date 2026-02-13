/**
 * Lead Detail Page
 * Shows lead info with ability to update stage and convert to client.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LeadStageSelector } from "./LeadStageSelector";
import { ConvertToClientButton } from "./ConvertToClientButton";
import { formatLineOfBusiness } from "@/lib/lineOfBusiness";

/**
 * Lead detail page.
 */
export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      convertedClient: {
        select: { id: true, name: true },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  const expectedValue = lead.expectedValue as number | null;

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/dashboard/pipeline"
          className="text-[#1C6ED5] hover:underline text-sm"
        >
          ← Back to Pipeline
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{lead.name}</h1>
            {lead.company && (
              <p className="text-gray-600 mt-1">{lead.company}</p>
            )}
          </div>
          <LeadStageSelector leadId={lead.id} currentStage={lead.stage} />
        </div>

        {/* Contact Info */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lead.email && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Email</p>
              <a
                href={`mailto:${lead.email}`}
                className="text-[#1C6ED5] hover:underline"
              >
                {lead.email}
              </a>
            </div>
          )}
          {lead.phone && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Phone</p>
              <a
                href={`tel:${lead.phone}`}
                className="text-[#1C6ED5] hover:underline"
              >
                {lead.phone}
              </a>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase">Source</p>
            <p className={lead.source === "other" && lead.sourceOther ? "" : "capitalize"}>
              {lead.source === "other" && lead.sourceOther
                ? lead.sourceOther
                : lead.source.replace(/_/g, " ")}
            </p>
          </div>
          {lead.source === "referral" && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Referral from</p>
              <p className="text-[#0B132B] font-medium">
                {lead.referralFrom?.trim() || "—"}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase">Line of business</p>
            <p className="text-[#0B132B]">{formatLineOfBusiness(lead.lineOfBusiness)}</p>
          </div>
          {expectedValue && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Expected Value</p>
              <p className="font-semibold text-green-600">
                RD${expectedValue.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase mb-2">Notes</p>
            <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {/* Intake Fields (show when intake-specific data exists) */}
        {(lead.addressToUse || lead.businessDescription || lead.serviceOutcome) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 uppercase mb-3 font-semibold">Business Intake</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.phone && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone</p>
                  <p className="text-[#0B132B]">{lead.phone}</p>
                  {lead.whatsappEnabled && (
                    <span className="text-xs text-[#25D366] font-medium">WhatsApp enabled</span>
                  )}
                </div>
              )}
              {lead.addressToUse && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Address</p>
                  <p className="text-[#0B132B]">{lead.addressToUse}</p>
                </div>
              )}
              {lead.domain && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Domain</p>
                  <p className="text-[#0B132B]">{lead.domain}</p>
                </div>
              )}
              {lead.paymentHandling && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">Payment Handling</p>
                  <p className="text-[#0B132B] capitalize">{lead.paymentHandling.replace(/_/g, " ").toLowerCase()}</p>
                </div>
              )}
            </div>
            {lead.businessDescription && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 uppercase">Business Description</p>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{lead.businessDescription}</p>
              </div>
            )}
            {lead.serviceOutcome && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 uppercase">Service Outcome</p>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{lead.serviceOutcome}</p>
              </div>
            )}

            {/* Logo preview + download */}
            {lead.hasLogo && lead.logoBlobUrl && (
              <div className="mt-4 flex items-start gap-4">
                <img
                  src={lead.logoBlobUrl}
                  alt="Business logo"
                  className="w-16 h-16 rounded-lg border border-gray-200 object-contain bg-white"
                />
                <div className="text-sm space-y-1">
                  {lead.logoContentType && <p className="text-gray-500">Type: {lead.logoContentType}</p>}
                  {lead.logoSize != null && <p className="text-gray-500">Size: {(lead.logoSize / 1024).toFixed(1)} KB</p>}
                  {lead.logoDownloadUrl && (
                    <a
                      href={lead.logoDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition mt-1"
                    >
                      Download Logo
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lost Reason */}
        {lead.stage === "lost" && lead.lostReason && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 uppercase mb-1">Lost Reason</p>
            <p className="text-red-700">{lead.lostReason}</p>
          </div>
        )}

        {/* Converted Client Link */}
        {lead.convertedClient && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 uppercase mb-1">
              Converted to Client
            </p>
            <Link
              href={`/dashboard/clients/${lead.convertedClient.id}`}
              className="text-green-700 font-medium hover:underline"
            >
              View {lead.convertedClient.name} →
            </Link>
          </div>
        )}
      </div>

      {/* Convert Action: show when not yet converted and not lost. Converting moves lead to Won and creates client. */}
      {!lead.convertedClient && lead.stage !== "lost" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Convert to Client
          </h2>
          <p className="text-gray-600 mb-4">
            Convert this lead to a client to finalize the win. This will create the client, move the lead to Won, and add them to the clients list. Once won, the lead cannot be moved back to any other stage.
          </p>
          <ConvertToClientButton
            leadId={lead.id}
            leadName={lead.name}
            leadEmail={lead.email}
          />
        </div>
      )}

      {/* Metadata */}
      <div className="mt-6 text-xs text-gray-400">
        <p>Created: {lead.createdAt.toLocaleString()}</p>
        <p>Updated: {lead.updatedAt.toLocaleString()}</p>
        <p>ID: {lead.id}</p>
      </div>
    </div>
  );
}
