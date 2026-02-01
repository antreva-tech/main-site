"use client";

/**
 * Modal to convert a lead to a client. Used when moving a lead to Won (drag or stage select).
 * Step 1: Custom confirmation prompt (won leads cannot be reverted). Step 2: Cedula/rnc form.
 */

import { useState, useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertLeadToClient } from "./actions";
import { EditModal } from "../components/EditModal";

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
 * Renders convert-to-client flow: confirmation step, then form. On submit, creates client and moves lead to Won.
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

  /** Reset to confirm step when modal opens. */
  useEffect(() => {
    if (open) setStep("confirm");
  }, [open]);

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const client = await convertLeadToClient(leadId, formData);
        onSuccess?.();
        handleClose();
        router.refresh();
        router.push(`/dashboard/clients/${client.id}`);
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to convert");
      }
    });
  };

  return (
    <EditModal
      open={open}
      onClose={handleClose}
      title="Convert to Client"
      titleId="convert-to-client-modal-title"
      maxWidth="max-w-xl"
      scrollContent={false}
    >
      <div className="space-y-4">
        {step === "confirm" ? (
          <>
            <p className="text-sm text-gray-700">
              Convert <strong>{leadName}</strong>
              {leadEmail && <span className="text-gray-500"> ({leadEmail})</span>} to a client?
            </p>
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This will create the client and move this lead to <strong>Won</strong>. Once won, this lead cannot be reverted or moved back to any other stage. Are you sure you want to continue?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                Continue to convert
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Add optional client details for <strong>{leadName}</strong>.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              Cedula (National ID)
            </label>
            <input
              name="cedula"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000-0000000-0"
            />
            <p className="text-xs text-gray-500 mt-1">Optional — for Dominican clients (invoicing)</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">
              RNC (Business Tax ID)
            </label>
            <input
              name="rnc"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="000000000"
            />
            <p className="text-xs text-gray-500 mt-1">Optional — for business clients</p>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setStep("confirm")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
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
  );
}
