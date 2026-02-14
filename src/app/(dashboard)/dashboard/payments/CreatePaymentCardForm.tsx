"use client";

/**
 * Modal form to create a pending payment card.
 * Uses the shared EditModal shell for consistent look across the dashboard.
 */

import { useActionState, useState, useMemo } from "react";
import { createPendingPaymentCard, type CreatePaymentCardState } from "./actions";
import { EditModal } from "../components/EditModal";
import type { SubscriptionOption, BankAccountOption } from "./data";

interface Props {
  subscriptions: SubscriptionOption[];
  bankAccounts: BankAccountOption[];
}

/** Input field styling — matches bank-accounts / pipeline forms. */
const inputClass =
  "w-full px-3 py-2.5 border border-gray-300 dark:border-gray-500 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-[#1C6ED5] transition-colors";

/** Select field styling — custom chevron, solid option bg. */
const selectClass =
  `${inputClass} appearance-none bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat` +
  ` bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%238A8F98'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")]` +
  ` pr-10`;

/** Label styling (reused). */
const labelClass =
  "block text-xs font-semibold text-[#8A8F98] dark:text-gray-400 uppercase tracking-wider mb-1.5";

/**
 * Trigger button + modal for creating a pending payment card.
 */
export function CreatePaymentCardForm({ subscriptions, bankAccounts }: Props) {
  const [state, formAction, isPending] = useActionState<CreatePaymentCardState, FormData>(
    createPendingPaymentCard,
    null
  );

  const [chargeType, setChargeType] = useState<"subscription" | "single">("subscription");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);

  /** Currently selected subscription data. */
  const selectedSub = useMemo(
    () => subscriptions.find((s) => s.id === selectedSubId) ?? null,
    [subscriptions, selectedSubId]
  );

  /** Whether the amount field is locked (subscription charge with a selection). */
  const amountLocked = chargeType === "subscription" && selectedSub !== null;

  /** Reset form and close modal on success. */
  if (state?.paymentId && open) {
    setOpen(false);
    setSelectedSubId("");
    setChargeType("subscription");
    setAmount("");
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 bg-[#1C6ED5] text-white text-sm rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all text-center"
      >
        + Create Payment Card
      </button>

      {/* Modal */}
      <EditModal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Pending Transaction"
        titleId="create-payment-modal-title"
        maxWidth="max-w-xl"
        footer={
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-[44px] px-4 py-2.5 border border-gray-300 dark:border-gray-500 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-payment-form"
              disabled={isPending}
              className="min-h-[44px] flex-1 px-5 py-2.5 bg-[#1C6ED5] text-white text-sm rounded-xl font-medium shadow-sm hover:bg-[#1559B3] hover:shadow transition-all disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Payment Card"}
            </button>
          </div>
        }
      >
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-sm text-red-700 dark:text-red-300">
            {state.error}
          </div>
        )}

        <form id="create-payment-form" action={formAction} className="space-y-4">
          {/* Charge type */}
          <div>
            <label className={labelClass}>Charge Type</label>
            <select
              name="chargeType"
              value={chargeType}
              onChange={(e) => {
                const type = e.target.value as "subscription" | "single";
                setChargeType(type);
                if (type === "subscription" && selectedSub) {
                  setAmount(String(selectedSub.amount));
                } else if (type === "single") {
                  setAmount("");
                }
              }}
              className={selectClass}
            >
              <option value="subscription">Subscription Charge</option>
              <option value="single">Single One-Time Payment</option>
            </select>
          </div>

          {/* Subscription (client) selector */}
          <div>
            <label className={labelClass}>Client / Subscription</label>
            <select
              name="subscriptionId"
              required
              value={selectedSubId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedSubId(id);
                if (chargeType === "subscription") {
                  const sub = subscriptions.find((s) => s.id === id);
                  setAmount(sub ? String(sub.amount) : "");
                }
              }}
              className={selectClass}
            >
              <option value="">Select a subscription...</option>
              {subscriptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.clientName} — {sub.serviceName} ({sub.currency === "DOP" ? "RD$" : "$"}
                  {sub.amount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Bank account selector */}
          <div>
            <label className={labelClass}>Receiving Bank Account</label>
            <select name="bankAccountId" required className={selectClass}>
              <option value="">Select account...</option>
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.bankName} (****{acc.accountNumberLast4}) — {acc.accountHolder}
                </option>
              ))}
            </select>
          </div>

          {/* Single-charge label */}
          {chargeType === "single" && (
            <div>
              <label className={labelClass}>Charge Label</label>
              <input
                type="text"
                name="chargeLabel"
                required
                placeholder="e.g. Setup fee"
                className={inputClass}
              />
            </div>
          )}

          {/* Amount — always controlled */}
          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="number"
              name="amount"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              readOnly={amountLocked}
              value={amount}
              onChange={(e) => { if (!amountLocked) setAmount(e.target.value); }}
              className={`${inputClass} ${amountLocked ? "!bg-gray-50 dark:!bg-gray-600 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Currency (hidden, derived from subscription) */}
          <input type="hidden" name="currency" value={selectedSub?.currency ?? "DOP"} />
        </form>
      </EditModal>
    </>
  );
}
