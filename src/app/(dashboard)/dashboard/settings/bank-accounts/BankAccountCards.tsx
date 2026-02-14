"use client";

/**
 * Bank account cards with Edit opening a modal; Remove with custom confirmation dialog.
 * Reveal toggle fetches decrypted full account number from server when shown.
 */

import { useState, useRef, useCallback } from "react";
import { EditModal } from "../../components/EditModal";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { getDecryptedAccountNumber } from "./actions";

type BankAccountRow = {
  id: string;
  bankName: string;
  routingNumber: string | null;
  accountNumberLast4: string;
  accountType: string;
  currency: string;
  accountHolder: string;
  isActive: boolean;
};

type Props = {
  accounts: BankAccountRow[];
  updateBankAccount: (formData: FormData) => Promise<void>;
  deleteBankAccount: (formData: FormData) => Promise<void>;
};

/** Decrypted full account numbers per id (only when revealed). */
type DecryptedState = Record<string, { value: string } | { error: string } | "loading">;

/** Toggle reveal of banking details; fetches decrypted full account number when revealing. */
function useRevealedBanking(
  onReveal: (id: string) => Promise<string>
) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [decrypted, setDecrypted] = useState<DecryptedState>({});

  const toggle = useCallback(
    async (id: string) => {
      if (revealedIds.has(id)) {
        setRevealedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setDecrypted((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return;
      }

      setRevealedIds((prev) => new Set(prev).add(id));
      setDecrypted((prev) => ({ ...prev, [id]: "loading" }));

      try {
        const value = await onReveal(id);
        setDecrypted((prev) => ({ ...prev, [id]: { value } }));
      } catch {
        setDecrypted((prev) => ({ ...prev, [id]: { error: "Failed to load account number" } }));
      }
    },
    [revealedIds, onReveal]
  );

  return { revealedIds, decrypted, toggle };
}

export function BankAccountCards({ accounts, updateBankAccount, deleteBankAccount }: Props) {
  const [editingAccount, setEditingAccount] = useState<BankAccountRow | null>(null);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const { revealedIds, decrypted, toggle } = useRevealedBanking(getDecryptedAccountNumber);

  return (
    <>
      <div className="grid gap-4">
        {accounts.map((account) => {
          const isRevealed = revealedIds.has(account.id);
          const d = decrypted[account.id];
          const hasValue = d && typeof d === "object" && "value" in d;
          const hasError = d && typeof d === "object" && "error" in d;
          return (
            <div
              key={account.id}
              className="dashboard-card dashboard-card-accent p-4 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-[#0B132B] dark:text-gray-100">
                    {account.bankName}
                  </h3>
                  <p className="text-[#8A8F98] dark:text-gray-400 mt-1 text-sm">
                    {isRevealed ? (
                      <>
                        {account.routingNumber && (
                          <span className="mr-2">Routing {account.routingNumber}</span>
                        )}
                        {d === "loading" && (
                          <span className="text-gray-500 dark:text-gray-500">Loading account number…</span>
                        )}
                        {hasValue && (
                          <span>Account: {(d as { value: string }).value}</span>
                        )}
                        {hasError && (
                          <span className="text-red-600 dark:text-red-400">{(d as { error: string }).error}</span>
                        )}
                        {isRevealed && !d && (
                          <span>Account (last 4): ****{account.accountNumberLast4}</span>
                        )}
                        {isRevealed && (
                          <>
                            <span className="mx-1">·</span>
                            <span>{account.accountType} · {account.currency}</span>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">•••• ·••• · {account.accountType} · {account.currency}</span>
                    )}
                  </p>
                  <p className="text-sm text-[#8A8F98] dark:text-gray-500 mt-2 truncate">
                    {account.accountHolder}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggle(account.id)}
                    className="mt-2 text-xs font-medium text-[#1C6ED5] dark:text-[#60a5fa] hover:underline focus:outline-none focus:underline"
                  >
                    {isRevealed ? "Hide banking info" : "Show banking info"}
                  </button>
                </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {account.isActive ? (
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/30 dark:text-white">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/12 text-gray-600 dark:bg-gray-500/25 dark:text-gray-400">
                    Inactive
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setEditingAccount(account)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <EditModal
        open={editingAccount !== null}
        onClose={() => setEditingAccount(null)}
        title="Edit bank account"
        titleId="bank-account-modal-title"
        maxWidth="max-w-xl"
        footer={
          editingAccount ? (
            <div className="flex justify-end">
              <form
                ref={deleteFormRef}
                action={deleteBankAccount}
                className="hidden"
              >
                <input type="hidden" name="id" value={editingAccount.id} />
              </form>
              <button
                type="button"
                onClick={() => setShowConfirmRemove(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition"
              >
                Remove
              </button>
            </div>
          ) : undefined
        }
      >
        {editingAccount && (
          <form
            action={updateBankAccount}
            className="grid grid-cols-2 gap-2 min-w-0 text-sm"
          >
            <input type="hidden" name="id" value={editingAccount.id} />
            <div className="col-span-2 min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Bank name *</label>
              <input
                name="bankName"
                required
                defaultValue={editingAccount.bankName}
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Routing number</label>
              <input
                name="routingNumber"
                defaultValue={editingAccount.routingNumber ?? ""}
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="Bank routing / ABA"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Account number (blank = keep)</label>
              <input
                name="accountNumber"
                type="text"
                autoComplete="off"
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="New to replace"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Account type</label>
              <select
                name="accountType"
                defaultValue={editingAccount.accountType}
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Currency</label>
              <select
                name="currency"
                defaultValue={editingAccount.currency}
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]"
              >
                <option value="DOP">DOP</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="col-span-2 min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Account holder *</label>
              <input
                name="accountHolder"
                required
                defaultValue={editingAccount.accountHolder}
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5]"
              />
            </div>
            <div className="col-span-2 flex items-center gap-3 flex-wrap pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={editingAccount.isActive}
                  value="on"
                  className="rounded border-gray-300 dark:border-gray-500 text-[#1C6ED5] focus:ring-[#1C6ED5]"
                />
                Active
              </label>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
                >
                  Save changes
                </button>
              </div>
            </div>
          </form>
        )}
      </EditModal>

      <ConfirmDialog
        open={showConfirmRemove}
        onClose={() => setShowConfirmRemove(false)}
        title="Remove bank account"
        message="Remove this bank account? Payments that used it will no longer show a receiving bank. This cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={() => {
          deleteFormRef.current?.requestSubmit();
          setEditingAccount(null);
        }}
        danger
      />
    </>
  );
}
