"use client";

/**
 * Intake snapshot panel for Development Project detail page.
 * CTO: editable form for all intake fields (fill in missing data or correct values).
 * Developer: read-only display.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateIntakeSnapshot } from "../actions";

/** Payment handling display labels. */
const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  MIXED: "Mixed",
};

/** Line of business options. */
const LOB_OPTIONS = [
  { value: "retail", label: "Retail" },
  { value: "tourism", label: "Tourism" },
  { value: "medical", label: "Medical" },
  { value: "restaurant", label: "Restaurant" },
  { value: "administrative", label: "Administrative" },
  { value: "warehouse_logistics", label: "Warehouse / Logistics" },
] as const;

/** Props shape matching DevelopmentProject intake snapshot columns. */
export type IntakeData = {
  intakeBusinessName: string | null;
  intakePhoneNumber: string | null;
  intakeAddressToUse: string | null;
  intakeHasDomain: boolean;
  intakeDomain: string | null;
  intakeWhatsappEnabled: boolean;
  intakeLineOfBusiness: string | null;
  intakePaymentHandling: string | null;
  intakeBusinessDescription: string | null;
  intakeServiceOutcome: string | null;
  intakeAdminEaseNotes: string | null;
  intakeHasLogo: boolean;
  intakeLogoBlobUrl: string | null;
  intakeLogoDownloadUrl: string | null;
  intakeLogoContentType: string | null;
  intakeLogoSize: number | null;
};

type Props = {
  projectId: string;
  data: IntakeData;
  /** CTO can edit; Developer sees read-only. */
  canEdit: boolean;
};

/**
 * Renders the intake snapshot. CTO gets an editable form; Developer gets read-only fields.
 */
export function IntakeSnapshotPanel({ projectId, data, canEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  /** Submit updated intake fields. */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("intakeHasDomain", fd.get("intakeHasDomain") === "on" ? "true" : "false");
    fd.set("intakeWhatsappEnabled", fd.get("intakeWhatsappEnabled") === "on" ? "true" : "false");

    startTransition(async () => {
      const result = await updateIntakeSnapshot(projectId, fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  };

  // If CTO is editing, show the form
  if (canEdit && editing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Edit Client Intake
          </h2>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Name" name="intakeBusinessName" defaultValue={data.intakeBusinessName} />
            <Field label="Phone" name="intakePhoneNumber" defaultValue={data.intakePhoneNumber} />
            <Field label="Address" name="intakeAddressToUse" defaultValue={data.intakeAddressToUse} />
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1">
                <input type="checkbox" name="intakeHasDomain" defaultChecked={data.intakeHasDomain} className="rounded border-gray-300 dark:border-gray-500" />
                Has domain
              </label>
              <input
                name="intakeDomain"
                defaultValue={data.intakeDomain ?? ""}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Line of Business</label>
              <select
                name="intakeLineOfBusiness"
                defaultValue={data.intakeLineOfBusiness ?? ""}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select...</option>
                {LOB_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Payment Handling</label>
              <select
                name="intakePaymentHandling"
                defaultValue={data.intakePaymentHandling ?? ""}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select...</option>
                {Object.entries(PAYMENT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="intakeWhatsappEnabled" defaultChecked={data.intakeWhatsappEnabled} className="rounded border-gray-300 dark:border-gray-500" />
            WhatsApp enabled
          </label>

          <TextArea label="Business Description" name="intakeBusinessDescription" defaultValue={data.intakeBusinessDescription} />
          <TextArea label="Service Outcome" name="intakeServiceOutcome" defaultValue={data.intakeServiceOutcome} />
          <TextArea label="Admin / Ease Notes" name="intakeAdminEaseNotes" defaultValue={data.intakeAdminEaseNotes} />

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save intake"}
          </button>
        </form>
      </div>
    );
  }

  // Read-only view (Developer always; CTO when not editing)
  const hasAny = Boolean(
    data.intakeBusinessName || data.intakePhoneNumber || data.intakeAddressToUse ||
    data.intakeBusinessDescription || data.intakeServiceOutcome || data.intakeAdminEaseNotes
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Client Intake
        </h2>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-[#1C6ED5] hover:underline font-medium"
          >
            {hasAny ? "Edit" : "Fill in intake"}
          </button>
        )}
      </div>

      {!hasAny ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No intake data recorded yet.{canEdit ? " Click \"Fill in intake\" to add fields." : ""}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <ReadOnlyField label="Business Name" value={data.intakeBusinessName} />
            <div>
              <ReadOnlyField label="Phone" value={data.intakePhoneNumber} />
              {data.intakeWhatsappEnabled && (
                <span className="text-xs text-[#25D366] font-medium">WhatsApp enabled</span>
              )}
            </div>
            <ReadOnlyField label="Address" value={data.intakeAddressToUse} />
            {data.intakeHasDomain && <ReadOnlyField label="Domain" value={data.intakeDomain} />}
            <ReadOnlyField label="Line of Business" value={data.intakeLineOfBusiness?.replace(/_/g, " ")} capitalize />
            <ReadOnlyField label="Payment Handling" value={data.intakePaymentHandling ? (PAYMENT_LABELS[data.intakePaymentHandling] ?? data.intakePaymentHandling) : null} />
          </div>

          {data.intakeBusinessDescription && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Business Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.intakeBusinessDescription}</p>
            </div>
          )}
          {data.intakeServiceOutcome && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Service Outcome</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.intakeServiceOutcome}</p>
            </div>
          )}
          {data.intakeAdminEaseNotes && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Admin / Ease Notes</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{data.intakeAdminEaseNotes}</p>
            </div>
          )}

          {/* Logo preview + download */}
          {data.intakeHasLogo && data.intakeLogoBlobUrl && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600 flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- external blob URL */}
              <img
                src={data.intakeLogoBlobUrl}
                alt="Business logo"
                className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-600 object-contain bg-white dark:bg-gray-700"
              />
              <div className="text-sm space-y-1">
                {data.intakeLogoContentType && <p className="text-gray-500 dark:text-gray-400">Type: {data.intakeLogoContentType}</p>}
                {data.intakeLogoSize != null && <p className="text-gray-500 dark:text-gray-400">Size: {(data.intakeLogoSize / 1024).toFixed(1)} KB</p>}
                {data.intakeLogoDownloadUrl && (
                  <a
                    href={data.intakeLogoDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition mt-1"
                  >
                    Download Logo
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Simple text input field for the edit form. */
function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string | null }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
}

/** Textarea field for the edit form. */
function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue: string | null }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">{label}</label>
      <textarea
        name={name}
        rows={2}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
}

/** Read-only field display. */
function ReadOnlyField({ label, value, capitalize }: { label: string; value: string | null | undefined; capitalize?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{label}</p>
      <p className={`text-gray-900 dark:text-gray-100 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
