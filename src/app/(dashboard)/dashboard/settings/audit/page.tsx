/**
 * Audit Log Viewer (CTO only)
 */

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogFilters } from "./AuditLogFilters";

/**
 * Audit log viewer page. Access restricted to users with CTO title.
 */
export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; action?: string }>;
}) {
  const session = await getSession();
  if (!session || session.title !== "CTO") {
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
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B132B] dark:text-gray-100 tracking-tight">
          Audit Log
        </h1>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>SOC 2 Compliance:</strong> All actions are logged and retained
          for 7 years. This log is immutable.
        </p>
      </div>

      <Suspense fallback={<div className="h-12 mb-6 rounded-xl bg-white/80 dark:bg-gray-700/50 animate-pulse" />}>
        <AuditLogFilters entityType={entityType} action={action} />
      </Suspense>

      <AuditLogTable logs={logs} />

      <p className="text-sm text-[#8A8F98] dark:text-gray-400 mt-4">
        Showing {logs.length} most recent entries
      </p>
    </div>
  );
}
