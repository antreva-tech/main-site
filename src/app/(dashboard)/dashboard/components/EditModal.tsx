"use client";

/**
 * Shared modal shell for edit flows across the admin dashboard.
 * Use for any edit/delete-in-modal pattern (subscriptions, credentials, contacts, bank accounts, etc.).
 */

import { useRef, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Unique id for the heading (for aria-labelledby). */
  titleId?: string;
  children: React.ReactNode;
  /** Optional footer (e.g. Remove/Delete button). Rendered in a separate row with border. */
  footer?: React.ReactNode;
  /** Max width class. Default: max-w-2xl */
  maxWidth?: "max-w-xl" | "max-w-2xl" | "max-w-3xl" | "max-w-4xl";
};

export function EditModal({
  open,
  onClose,
  title,
  titleId = "edit-modal-title",
  children,
  footer,
  maxWidth = "max-w-2xl",
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

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-[calc(100vw-2rem)] ${maxWidth} max-h-[90vh] flex flex-col min-w-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 truncate min-w-0">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition flex-shrink-0 flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto overflow-x-hidden flex-1 min-w-0">{children}</div>

        {footer != null && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
