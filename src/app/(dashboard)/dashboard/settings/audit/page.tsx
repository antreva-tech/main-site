/**
 * Audit Log Viewer (Admin/Readonly)
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Audit log viewer page.
 */
export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; action?: string }>;
}) {
  const session = await getSession();
  if (!session?.permissions.includes("audit.read")) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const entityType = params.entityType;
  const action = params.action;

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(entityType ? { entityType: entityType as "user" | "lead" | "client" | "ticket" | "payment" | "subscription" | "credential" | "whatsapp" | "session" | "role" } : {}),
      ...(action ? { action: action as "create" | "read" | "update" | "delete" | "decrypt" | "login" | "logout" | "failed_login" } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Log</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>SOC 2 Compliance:</strong> All actions are logged and retained
          for 7 years. This log is immutable.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select className="flex-1 min-w-[140px] sm:flex-none px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="">All Entity Types</option>
          <option value="user">User</option>
          <option value="lead">Lead</option>
          <option value="client">Client</option>
          <option value="ticket">Ticket</option>
          <option value="payment">Payment</option>
          <option value="credential">Credential</option>
          <option value="session">Session</option>
        </select>
        <select className="flex-1 min-w-[140px] sm:flex-none px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="decrypt">Decrypt</option>
          <option value="login">Login</option>
          <option value="failed_login">Failed Login</option>
        </select>
      </div>

      {/* Desktop: Log Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-sm">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-600">
                  {log.createdAt.toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  {log.user?.name || log.user?.email || "System"}
                </td>
                <td className="px-6 py-3">
                  <ActionBadge action={log.action} />
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {log.entityType}:{log.entityId.slice(0, 8)}...
                </td>
                <td className="px-6 py-3 text-gray-500 truncate max-w-xs">
                  {log.metadata ? JSON.stringify(log.metadata).slice(0, 50) : "-"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {logs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-gray-500">
            No audit logs found
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600">
                    {log.createdAt.toLocaleString()}
                  </p>
                  <p className="font-medium text-gray-900 mt-1">
                    {log.user?.name || log.user?.email || "System"}
                  </p>
                </div>
                <ActionBadge action={log.action} />
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 text-sm font-mono">
                <p className="text-gray-600">
                  {log.entityType}:{log.entityId.slice(0, 8)}...
                </p>
                {log.metadata && (
                  <p className="text-gray-500 truncate mt-1 text-xs">
                    {JSON.stringify(log.metadata).slice(0, 60)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-sm text-gray-400 mt-4">
        Showing {logs.length} most recent entries
      </p>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    create: "bg-green-100 text-green-700",
    update: "bg-blue-100 text-blue-700",
    delete: "bg-red-100 text-red-700",
    decrypt: "bg-yellow-100 text-yellow-700",
    login: "bg-purple-100 text-purple-700",
    logout: "bg-gray-100 text-gray-600",
    failed_login: "bg-red-100 text-red-700",
    read: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[action] || styles.read}`}>
      {action}
    </span>
  );
}
