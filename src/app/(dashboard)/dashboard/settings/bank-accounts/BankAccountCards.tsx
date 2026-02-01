"use client";

/**
 * Bank account cards with Edit opening a modal; Remove with custom confirmation dialog.
 */

import { useState, useRef } from "react";
import { EditModal } from "../../components/EditModal";
import { ConfirmDialog } from "../../components/ConfirmDialog";

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

export function BankAccountCards({ accounts, updateBankAccount, deleteBankAccount }: Props) {
  const [editingAccount, setEditingAccount] = useState<BankAccountRow | null>(null);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <div className="grid gap-4">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {account.bankName}
                </h3>
                <p className="text-gray-600 mt-1 text-sm">
                  {account.routingNumber && (
                    <span className="mr-2">Routing {account.routingNumber}</span>
                  )}
                  ****{account.accountNumberLast4} · {account.accountType} · {account.currency}
                </p>
                <p className="text-sm text-gray-500 mt-2 truncate">
                  {account.accountHolder}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {account.isActive ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    Inactive
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setEditingAccount(account)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
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
                className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 transition"
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
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Routing number</label>
              <input
                name="routingNumber"
                defaultValue={editingAccount.routingNumber ?? ""}
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="Bank routing / ABA"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Account number (blank = keep)</label>
              <input
                name="accountNumber"
                type="password"
                autoComplete="off"
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
                placeholder="New to replace"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs text-gray-500 uppercase mb-0.5">Account type</label>
              <select
                name="accountType"
                defaultValue={editingAccount.accountType}
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
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
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
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
                className="w-full min-w-0 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              />
            </div>
            <div className="col-span-2 flex items-center gap-3 flex-wrap pt-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={editingAccount.isActive}
                  value="on"
                  className="rounded border-gray-300 text-[#1C6ED5] focus:ring-[#1C6ED5]"
                />
                Active
              </label>
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium"
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
        onConfirm={() => deleteFormRef.current?.requestSubmit()}
        danger
      />
    </>
  );
}
