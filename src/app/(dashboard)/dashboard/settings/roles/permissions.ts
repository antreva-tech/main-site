/**
 * Permission keys and display labels for the roles UI (must stay in sync with seed).
 * Shared by roles page and actions; not in actions.ts so "use server" file only exports async functions.
 */

export const AVAILABLE_PERMISSIONS: Array<{ value: string; label: string }> = [
  { value: "leads.read", label: "Leads: read" },
  { value: "leads.write", label: "Leads: write" },
  { value: "clients.read", label: "Clients: read" },
  { value: "clients.write", label: "Clients: write" },
  { value: "credentials.read", label: "Credentials: read" },
  { value: "credentials.decrypt", label: "Credentials: decrypt" },
  { value: "tickets.read", label: "Tickets: read" },
  { value: "tickets.write", label: "Tickets: write" },
  { value: "payments.read", label: "Payments: read" },
  { value: "payments.write", label: "Payments: write" },
  { value: "users.manage", label: "Users: manage" },
  { value: "roles.manage", label: "Roles: manage" },
  { value: "audit.read", label: "Audit: read" },
];
