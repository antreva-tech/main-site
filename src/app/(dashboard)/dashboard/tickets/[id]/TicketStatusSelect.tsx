/**
 * Ticket Status Select Component
 * When changing from Open to another status with no assignee, shows a modal to assign first.
 */

"use client";

import { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTicketStatus, assignTicket } from "../actions";
import type { TicketStatus } from "@prisma/client";
import { AssignTicketModal } from "./AssignTicketModal";

const STATUSES: { key: TicketStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "waiting", label: "Waiting" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

type User = { id: string; name: string };

export function TicketStatusSelect({
  ticketId,
  currentStatus,
  assignedToId,
  assignableUsers,
}: {
  ticketId: string;
  currentStatus: TicketStatus;
  assignedToId: string | null;
  assignableUsers: User[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectValue, setSelectValue] = useState<TicketStatus>(currentStatus);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);

  useEffect(() => {
    setSelectValue(currentStatus);
  }, [currentStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TicketStatus;
    const needsAssign =
      currentStatus === "open" &&
      newStatus !== "open" &&
      !assignedToId &&
      assignableUsers.length > 0;

    if (needsAssign) {
      setPendingStatus(newStatus);
      setShowAssignModal(true);
      setSelectValue(currentStatus);
      return;
    }

    setSelectValue(newStatus);
    startTransition(() => {
      updateTicketStatus(ticketId, newStatus).then(() => router.refresh());
    });
  };

  const handleAssignConfirm = (userId: string) => {
    if (!pendingStatus) return;
    startTransition(async () => {
      await assignTicket(ticketId, userId);
      await updateTicketStatus(ticketId, pendingStatus);
      setShowAssignModal(false);
      setPendingStatus(null);
      setSelectValue(pendingStatus);
      router.refresh();
    });
  };

  const handleAssignClose = () => {
    setShowAssignModal(false);
    setPendingStatus(null);
    setSelectValue(currentStatus);
  };

  return (
    <>
      <select
        value={selectValue}
        onChange={handleChange}
        disabled={isPending}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] disabled:opacity-50 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      <AssignTicketModal
        open={showAssignModal}
        onClose={handleAssignClose}
        assignableUsers={assignableUsers}
        onConfirm={handleAssignConfirm}
        isPending={isPending}
      />
    </>
  );
}
