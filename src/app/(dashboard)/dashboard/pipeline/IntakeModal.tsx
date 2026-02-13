"use client";

/**
 * Intake modal for WON gate: collects all required business intake fields and optional logo upload.
 * Opens when converting a lead to WON and intake data is missing.
 * Uses Vercel Blob client upload for logo.
 */

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { EditModal } from "../components/EditModal";
import { saveIntakeFields } from "./actions";
import { PAYMENT_HANDLING_VALUES } from "./intakeHelpers";

/** Line of business options (must match Prisma LineOfBusiness enum). */
const LINE_OF_BUSINESS_OPTIONS = [
  { value: "retail", label: "Retail" },
  { value: "tourism", label: "Tourism" },
  { value: "medical", label: "Medical" },
  { value: "restaurant", label: "Restaurant" },
  { value: "administrative", label: "Administrative" },
  { value: "warehouse_logistics", label: "Warehouse / Logistics" },
] as const;

/** Payment handling display labels. */
const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  MIXED: "Mixed",
};

/** Lead data shape needed by the intake modal. */
export type IntakeLeadData = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  hasLogo: boolean;
  logoBlobUrl: string | null;
  logoDownloadUrl: string | null;
  logoContentType: string | null;
  logoSize: number | null;
  hasDomain: boolean;
  domain: string | null;
  addressToUse: string | null;
  whatsappEnabled: boolean;
  businessDescription: string | null;
  serviceOutcome: string | null;
  adminEaseNotes: string | null;
  lineOfBusiness: string | null;
  paymentHandling: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  lead: IntakeLeadData;
  /** Field names that the server says are missing (highlight these). */
  missingFields?: string[];
  /** Called after a successful save so the parent can retry convert. */
  onSaved?: () => void;
};

/**
 * Renders the WON intake form inside an EditModal.
 * Includes logo upload via Vercel Blob client, preview, and download.
 */
export function IntakeModal({
  open,
  onClose,
  lead,
  missingFields = [],
  onSaved,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoBlobUrl, setLogoBlobUrl] = useState(lead.logoBlobUrl);
  const [logoDownloadUrl, setLogoDownloadUrl] = useState(lead.logoDownloadUrl);
  const [logoContentType, setLogoContentType] = useState(lead.logoContentType);
  const [logoSize, setLogoSize] = useState(lead.logoSize);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle states
  const [hasLogo, setHasLogo] = useState(lead.hasLogo);
  const [hasDomain, setHasDomain] = useState(lead.hasDomain);

  const isMissing = useCallback(
    (field: string) => missingFields.includes(field),
    [missingFields]
  );

  /** Upload logo via Vercel Blob client flow. */
  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/logo-upload",
        clientPayload: JSON.stringify({ entityId: lead.id }),
      });
      setLogoBlobUrl(blob.url);
      setLogoDownloadUrl(blob.downloadUrl);
      setLogoContentType(blob.contentType);
      setLogoSize(file.size);
      setHasLogo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setLogoUploading(false);
    }
  };

  /** Remove logo from local state (server cleared on save). */
  const handleRemoveLogo = () => {
    setLogoBlobUrl(null);
    setLogoDownloadUrl(null);
    setLogoContentType(null);
    setLogoSize(null);
    setHasLogo(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Save all intake fields to lead via server action. */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    // Inject logo state (managed outside form inputs)
    fd.set("hasLogo", hasLogo ? "true" : "false");
    fd.set("logoBlobUrl", logoBlobUrl ?? "");
    fd.set("logoDownloadUrl", logoDownloadUrl ?? "");
    fd.set("logoContentType", logoContentType ?? "");
    fd.set("logoSize", logoSize != null ? String(logoSize) : "");

    // Inject toggle booleans
    fd.set("hasDomain", hasDomain ? "true" : "false");
    fd.set("whatsappEnabled", fd.get("whatsappEnabled") === "on" ? "true" : "false");

    startTransition(async () => {
      try {
        const result = await saveIntakeFields(lead.id, fd);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.refresh();
        onSaved?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save intake");
      }
    });
  };

  /** Ring style for missing/required fields. */
  const ringClass = (field: string) =>
    isMissing(field) ? "ring-2 ring-red-400" : "";

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title={`Intake — ${lead.name}`}
      titleId="intake-modal-title"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Company (Business Name) */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
            Company / Business Name *
          </label>
          <input
            name="company"
            defaultValue={lead.company ?? ""}
            required
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("company")}`}
          />
        </div>

        {/* Logo Section */}
        <fieldset className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3">
          <legend className="text-xs text-gray-500 dark:text-gray-400 uppercase px-1">Logo</legend>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={hasLogo}
              onChange={(e) => setHasLogo(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-500"
            />
            Business has a logo
          </label>

          {hasLogo && (
            <div className="space-y-3">
              {logoBlobUrl ? (
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- external blob URL with unknown dimensions */}
                  <img
                    src={logoBlobUrl}
                    alt="Logo preview"
                    className="w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-600 object-contain bg-white"
                  />
                  <div className="flex-1 text-sm space-y-1">
                    {logoContentType && (
                      <p className="text-gray-500">Type: {logoContentType}</p>
                    )}
                    {logoSize != null && (
                      <p className="text-gray-500">
                        Size: {(logoSize / 1024).toFixed(1)} KB
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {logoDownloadUrl && (
                        <a
                          href={logoDownloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="px-3 py-1.5 text-xs font-medium bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition"
                        >
                          Download
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-1.5 text-xs font-medium border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                    className={`text-sm ${ringClass("logoBlobUrl")}`}
                    disabled={logoUploading}
                  />
                  {logoUploading && (
                    <p className="text-xs text-[#1C6ED5] mt-1">Uploading...</p>
                  )}
                </div>
              )}
            </div>
          )}
        </fieldset>

        {/* Domain Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
              <input
                type="checkbox"
                checked={hasDomain}
                onChange={(e) => setHasDomain(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-500"
              />
              Has domain
            </label>
            {hasDomain && (
              <input
                name="domain"
                defaultValue={lead.domain ?? ""}
                placeholder="example.com"
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("domain")}`}
              />
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
              Address to use *
            </label>
            <input
              name="addressToUse"
              defaultValue={lead.addressToUse ?? ""}
              required
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("addressToUse")}`}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
              Phone *
            </label>
            <input
              name="phone"
              defaultValue={lead.phone ?? ""}
              required
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("phone")}`}
            />
          </div>
        </div>

        {/* WhatsApp */}
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            name="whatsappEnabled"
            defaultChecked={lead.whatsappEnabled}
            className="rounded border-gray-300 dark:border-gray-500"
          />
          WhatsApp enabled on business phone
        </label>

        {/* Text Areas */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
            Business Description *
          </label>
          <textarea
            name="businessDescription"
            defaultValue={lead.businessDescription ?? ""}
            required
            rows={3}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("businessDescription")}`}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
            Service Outcome *
          </label>
          <textarea
            name="serviceOutcome"
            defaultValue={lead.serviceOutcome ?? ""}
            required
            rows={2}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("serviceOutcome")}`}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
            Admin / Ease Notes *
          </label>
          <textarea
            name="adminEaseNotes"
            defaultValue={lead.adminEaseNotes ?? ""}
            required
            rows={2}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("adminEaseNotes")}`}
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
              Line of Business *
            </label>
            <select
              name="lineOfBusiness"
              defaultValue={lead.lineOfBusiness ?? ""}
              required
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("lineOfBusiness")}`}
            >
              <option value="">Select...</option>
              {LINE_OF_BUSINESS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
              Payment Handling *
            </label>
            <select
              name="paymentHandling"
              defaultValue={lead.paymentHandling ?? ""}
              required
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] ${ringClass("paymentHandling")}`}
            >
              <option value="">Select...</option>
              {PAYMENT_HANDLING_VALUES.map((val) => (
                <option key={val} value={val}>
                  {PAYMENT_LABELS[val]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || logoUploading}
            className="flex-1 px-4 py-2 bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition text-sm font-medium disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Intake"}
          </button>
        </div>
      </form>
    </EditModal>
  );
}
