"use client";

/**
 * Custom confirmation dialog (not browser confirm).
 * Use for remove/delete confirmations across the dashboard.
 */

import { useRef, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Called when user clicks Confirm; then onClose is called. */
  onConfirm: () => void;
  /** Red/danger style for confirm button. Default true. */
  danger?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  danger = true,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-[#1C6ED5] text-white hover:bg-[#1559B3]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
