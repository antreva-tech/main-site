/**
 * Convert Lead to Client Button with Modal
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertLeadToClient } from "../actions";

/**
 * Button that opens conversion modal.
 */
export function ConvertToClientButton({
  leadId,
  leadName,
  leadEmail,
}: {
  leadId: string;
  leadName: string;
  leadEmail: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const client = await convertLeadToClient(leadId, formData);
      setOpen(false);
      router.push(`/dashboard/clients/${client.id}`);
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Convert to Client
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Convert to Client
            </h2>

            <p className="text-gray-600 mb-4">
              Converting <strong>{leadName}</strong> to a client.
              {leadEmail && (
                <span className="text-gray-500"> ({leadEmail})</span>
              )}
            </p>

            <form action={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cedula (National ID)
                  </label>
                  <input
                    name="cedula"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
                    placeholder="000-0000000-0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for Dominican clients (invoicing)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RNC (Business Tax ID)
                  </label>
                  <input
                    name="rnc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5]"
                    placeholder="000000000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for business clients
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isPending ? "Converting..." : "Convert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
