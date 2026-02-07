"use client";

/**
 * Modal shown when changing ticket status from Open to another status
 * without an assignee. User must pick an assignee to continue.
 */

import { useRef, useEffect, useState } from "react";

type User = { id: string; name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  assignableUsers: User[];
  onConfirm: (userId: string) => void;
  isPending?: boolean;
};

export function AssignTicketModal({
  open,
  onClose,
  assignableUsers,
  onConfirm,
  isPending = false,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      setSelectedUserId(assignableUsers[0]?.id ?? "");
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose, assignableUsers]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleConfirm = () => {
    if (selectedUserId) {
      onConfirm(selectedUserId);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-ticket-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="assign-ticket-title" className="text-lg font-semibold text-gray-900 mb-2">
          Assign ticket
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          This ticket has no assignee. Please assign it to someone before changing the status.
        </p>
        <label htmlFor="assign-select" className="block text-sm font-medium text-gray-700 mb-2">
          Assign to
        </label>
        <select
          id="assign-select"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={isPending}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1C6ED5] disabled:opacity-50 text-sm mb-6"
        >
          {assignableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || !selectedUserId}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#1C6ED5] text-white hover:bg-[#1559B3] transition disabled:opacity-50"
          >
            {isPending ? "Assigning…" : "Assign & update status"}
          </button>
        </div>
      </div>
    </div>
  );
}
