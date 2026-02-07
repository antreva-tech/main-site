/**
 * Demo Sites page: quick-access list for sales and CEO.
 * All users can view and open links; only users.manage can add/edit/delete.
 */

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DemoSiteList } from "./DemoSiteList";
import { AddDemoForm } from "./AddDemoForm";

export default async function DemosPage() {
  const session = await getSession();
  const canManage = session?.permissions.includes("users.manage") ?? false;

  const demos =
    typeof prisma.demoSite?.findMany === "function"
      ? await prisma.demoSite.findMany({
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            url: true,
            adminPortalUrl: true,
            demoLoginUsername: true,
            demoLoginPassword: true,
            description: true,
            sortOrder: true,
          },
        })
      : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0B132B] dark:text-gray-100 tracking-tight">
            Demo Sites
          </h1>
          <p className="mt-1 text-sm text-[#8A8F98] dark:text-gray-400">
            Quick links to demo sites for sales calls and presentations.
          </p>
        </div>
        {canManage && <AddDemoForm />}
      </div>

      <DemoSiteList demos={demos} canManage={canManage} />
    </div>
  );
}
