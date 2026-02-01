/**
 * Payment Action Buttons (Confirm/Reject)
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmPayment, rejectPayment } from "../actions";

/**
 * Payment confirmation/rejection actions.
 */
export function PaymentActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!confirm("Are you sure you want to confirm this payment?")) return;

    startTransition(async () => {
      await confirmPayment(paymentId);
      router.refresh();
    });
  };

  const handleReject = () => {
    if (!rejectNotes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    startTransition(async () => {
      await rejectPayment(paymentId, rejectNotes);
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Confirm Payment
      </h2>
      <p className="text-gray-600 mb-4">
        Review the transfer details above and verify against your bank statement
        before confirming.
      </p>

      {!showReject ? (
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Confirm Payment"}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={isPending}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      ) : (
        <div>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="Reason for rejection..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowReject(false)}
              disabled={isPending}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isPending || !rejectNotes.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {isPending ? "Rejecting..." : "Reject Payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
