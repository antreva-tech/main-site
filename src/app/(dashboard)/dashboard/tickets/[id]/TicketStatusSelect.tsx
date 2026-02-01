/**
 * Ticket Status Select Component
 */

"use client";

import { useTransition } from "react";
import { updateTicketStatus } from "../actions";
import type { TicketStatus } from "@prisma/client";

const STATUSES: { key: TicketStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "waiting", label: "Waiting" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export function TicketStatusSelect({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: TicketStatus;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      updateTicketStatus(ticketId, e.target.value as TicketStatus);
    });
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1C6ED5] disabled:opacity-50 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s.key} value={s.key}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
