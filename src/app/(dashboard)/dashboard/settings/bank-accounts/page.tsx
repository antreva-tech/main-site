/**
 * Bank Accounts Management Page (Admin Only)
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bank Accounts</h1>
        <button className="w-full sm:w-auto px-4 py-2.5 bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition text-center">
          + Add Account
        </button>
      </div>

      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Antreva&apos;s receiving bank accounts for client payments.
      </p>

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
              </div>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No bank accounts configured.</p>
          </div>
        )}
      </div>
    </div>
  );
}
