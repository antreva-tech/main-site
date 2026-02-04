/**
 * Overview widget configuration: maps widget keys to required read permission.
 * Used to show only role-relevant KPIs and list widgets on the dashboard.
 */

/** KPI card key → permission required to show */
export const KPI_PERMISSION: Record<string, string> = {
  pipeline: "leads.read",
  clients: "clients.read",
  revenue: "clients.read",
  payments: "payments.read",
  tickets: "tickets.read",
};

/** List widget key → permission required to show */
export const LIST_PERMISSION: Record<string, string> = {
  recentLeads: "leads.read",
  pendingPayments: "payments.read",
  openTickets: "tickets.read",
};

/** Write permission for primary actions (e.g. Create Lead on Recent Leads card) */
export const LIST_WRITE_ACTION: Record<string, string | undefined> = {
  recentLeads: "leads.write",
  pendingPayments: "payments.write",
  openTickets: "tickets.write",
};

/**
 * Returns KPI keys the user is allowed to see.
 */
export function allowedKpis(permissions: string[]): string[] {
  return (Object.keys(KPI_PERMISSION) as string[]).filter((k) =>
    permissions.includes(KPI_PERMISSION[k])
  );
}

/**
 * Returns list widget keys the user is allowed to see.
 */
export function allowedLists(permissions: string[]): string[] {
  return (Object.keys(LIST_PERMISSION) as string[]).filter((k) =>
    permissions.includes(LIST_PERMISSION[k])
  );
}

/**
 * Returns whether the user can see the primary action for a list widget (e.g. Create Lead).
 */
export function canShowListAction(
  listKey: string,
  permissions: string[]
): boolean {
  const writePerm = LIST_WRITE_ACTION[listKey];
  return !!writePerm && permissions.includes(writePerm);
}
