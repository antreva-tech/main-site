"use client";

/**
 * Modal to convert a lead to a client. Used when moving a lead to Won (drag or stage select).
 * Step 1: Custom confirmation prompt (won leads cannot be reverted).
 * Step 2: Cedula/rnc form.
 * If the server returns INTAKE_REQUIRED_FOR_WON, opens the IntakeModal to collect missing fields.
 */

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertLeadToClient } from "./actions";
import { EditModal } from "../components/EditModal";
import { IntakeModal, type IntakeLeadData } from "./IntakeModal";

type Props = {
  open: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  leadEmail: string | null;
  /** Called after successful conversion (before navigation). */
  onSuccess?: () => void;
};

/**
 * Renders convert-to-client flow: confirmation step, then form.
 * On submit, creates client and moves lead to Won.
 * If intake incomplete, opens IntakeModal overlay.
 */
export function ConvertToClientModal({
  open,
  onClose,
  leadId,
  leadName,
  leadEmail,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"confirm" | "form">("confirm");
  const [isPending, startTransition] = useTransition();

  // Intake gate state
  const [showIntake, setShowIntake] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [intakeLead, setIntakeLead] = useState<IntakeLeadData | null>(null);

  /** Resets all modal state and closes. */
  const handleClose = () => {
    setStep("confirm");
    setShowIntake(false);
    setMissingFields([]);
    setIntakeLead(null);
    onClose();
  };

  /** Fetch the lead's current intake data for the intake modal. */
  const fetchLeadIntake = async (): Promise<IntakeLeadData> => {
    const res = await fetch(`/api/leads/${leadId}/intake`);
    if (!res.ok) {
      return {
        id: leadId,
        name: leadName,
        company: null,
        phone: null,
        hasLogo: false,
        logoBlobUrl: null,
        logoDownloadUrl: null,
        logoContentType: null,
        logoSize: null,
        hasDomain: false,
        domain: null,
        addressToUse: null,
        whatsappEnabled: false,
        businessDescription: null,
        serviceOutcome: null,
        adminEaseNotes: null,
        lineOfBusiness: null,
        paymentHandling: null,
      };
    }
    return res.json();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await convertLeadToClient(leadId, formData);

        // Intake gate: server returned missing fields
        if (result.code === "INTAKE_REQUIRED_FOR_WON") {
          setMissingFields(result.missingFields ?? []);
          const leadData = await fetchLeadIntake();
          setIntakeLead(leadData);
          setShowIntake(true);
          return;
        }

        if (result.error) {
          alert(result.error);
          return;
        }

        onSuccess?.();
        handleClose();
        router.refresh();
        router.push(`/dashboard/clients/${result.id}`);
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to convert");
      }
    });
  };

  /** Called after intake save; retry the conversion. */
  const handleIntakeSaved = () => {
    setShowIntake(false);
    setMissingFields([]);
    // Re-trigger submit by clicking the form submit button
    const form = document.getElementById("convert-form") as HTMLFormElement | null;
    if (form) {
      const fd = new FormData(form);
      startTransition(async () => {
        try {
          const result = await convertLeadToClient(leadId, fd);
          if (result.code === "INTAKE_REQUIRED_FOR_WON") {
            setMissingFields(result.missingFields ?? []);
            const leadData = await fetchLeadIntake();
            setIntakeLead(leadData);
            setShowIntake(true);
            return;
          }
          if (result.error) {
            alert(result.error);
            return;
          }
          onSuccess?.();
          handleClose();
          router.refresh();
          router.push(`/dashboard/clients/${result.id}`);
        } catch (err) {
          console.error(err);
          alert(err instanceof Error ? err.message : "Failed to convert");
        }
      });
    }
  };

  return (
    <>
      <EditModal
        open={open && !showIntake}
        onClose={handleClose}
        title="Convert to Client"
        titleId="convert-to-client-modal-title"
        maxWidth="max-w-xl"
        scrollContent={false}
      >
        <div className="space-y-4">
          {step === "confirm" ? (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Convert <strong>{leadName}</strong>
                {leadEmail && <span className="text-gray-500 dark:text-gray-400"> ({leadEmail})</span>} to a client?
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
                This will create the client and move this lead to <strong>Won</strong>. Once won, this lead cannot be reverted or moved back to any other stage. Are you sure you want to continue?
              </p>
              {missingFields.length > 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
                  Some intake fields are still missing. Please complete the intake form first.
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition text-sm font-medium"
                >
                  Continue to convert
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add optional client details for <strong>{leadName}</strong>.
              </p>
              <form id="convert-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                Cedula (National ID)
              </label>
              <input
                name="cedula"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="000-0000000-0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional — for Dominican clients (invoicing)</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                RNC (Business Tax ID)
              </label>
              <input
                name="rnc"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="000000000"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional — for business clients</p>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
              >
                {isPending ? "Converting..." : "Convert to Client"}
              </button>
            </div>
          </form>
            </>
          )}
        </div>
      </EditModal>

      {/* Intake Modal overlay — shown when server says intake fields are incomplete */}
      {showIntake && intakeLead && (
        <IntakeModal
          open={true}
          onClose={() => setShowIntake(false)}
          lead={intakeLead}
          missingFields={missingFields}
          onSaved={handleIntakeSaved}
        />
      )}
    </>
  );
}
