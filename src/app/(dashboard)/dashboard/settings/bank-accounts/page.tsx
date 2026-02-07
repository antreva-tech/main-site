/**
 * Bank Accounts Management Page (Admin Only)
 * Add and edit receiving bank accounts; account numbers are encrypted at rest.
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createBankAccount, updateBankAccount, deleteBankAccount } from "./actions";
import { BankAccountCards } from "./BankAccountCards";

/**
 * Bank accounts management page.
 */
export default async function BankAccountsPage() {
  const session = await getSession();
  if (!session?.permissions.includes("users.manage")) {
    redirect("/dashboard");
  }

  const accounts = await prisma.bankAccount.findMany({
    orderBy: { bankName: "asc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B132B] dark:text-gray-100 tracking-tight">
          Bank Accounts
        </h1>
        <p className="text-[#8A8F98] dark:text-gray-400 mt-1 text-sm sm:text-base">
          Antreva&apos;s receiving bank accounts for client payments. Account numbers are encrypted; only last 4 digits are stored for display.
        </p>
      </div>

      {/* Add account */}
      <details className="mb-6 dashboard-card overflow-hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[#1C6ED5] hover:bg-[#1C6ED5]/[0.06] dark:hover:bg-white/[0.06] list-none transition-colors">
          + Add Account
        </summary>
        <form action={createBankAccount} className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-600 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Bank name *</label>
            <input
              name="bankName"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="e.g. Banreservas"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Routing number</label>
            <input
              name="routingNumber"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Bank routing / ABA"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Account number *</label>
            <input
              name="accountNumber"
              required
              type="password"
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="Full number (encrypted at rest)"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Account type</label>
            <select
              name="accountType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Currency</label>
            <select
              name="currency"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
            >
              <option value="DOP">DOP</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase mb-1">Account holder *</label>
            <input
              name="accountHolder"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
              placeholder="e.g. Antreva Tech SRL"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium"
            >
              Add account
            </button>
          </div>
        </form>
      </details>

      {accounts.length > 0 ? (
        <BankAccountCards
          accounts={accounts.map((a) => ({
            id: a.id,
            bankName: a.bankName,
            routingNumber: a.routingNumber,
            accountNumberLast4: a.accountNumberLast4,
            accountType: a.accountType,
            currency: a.currency,
            accountHolder: a.accountHolder,
            isActive: a.isActive,
          }))}
          updateBankAccount={updateBankAccount}
          deleteBankAccount={deleteBankAccount}
        />
      ) : (
        <div className="dashboard-card px-6 py-14 text-center text-[#8A8F98] dark:text-gray-400">
          No bank accounts configured. Use &quot;+ Add Account&quot; above to add one.
        </div>
      )}
    </div>
  );
}
