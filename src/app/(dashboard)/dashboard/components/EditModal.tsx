"use client";

/**
 * Shared modal shell for edit flows across the admin dashboard.
 * Use for any edit/delete-in-modal pattern (subscriptions, credentials, contacts, bank accounts, etc.).
 * Renders via portal to document.body so it is viewport-centered above sidebar/layout.
 */

import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
  maxWidth?: "max-w-sm" | "max-w-xl" | "max-w-2xl" | "max-w-3xl" | "max-w-4xl";
  /** When false, content area grows with content (no internal scroll). Use for compact cards like lead view. */
  scrollContent?: boolean;
  /** When true, content and panel allow overflow so dropdowns can extend outside the box (no scroll, no clip). */
  allowContentOverflow?: boolean;
};

export function EditModal({
  open,
  onClose,
  title,
  titleId = "edit-modal-title",
  children,
  footer,
  maxWidth = "max-w-2xl",
  scrollContent = true,
  allowContentOverflow = false,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!open) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 ${allowContentOverflow ? "overflow-visible" : "overflow-hidden"}`}
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-xl w-full max-w-[calc(100vw-2rem)] ${maxWidth} flex flex-col min-w-0 max-h-[85vh] ${allowContentOverflow ? "overflow-visible" : scrollContent ? "" : "overflow-hidden"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate min-w-0">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition flex-shrink-0 flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          className={`min-w-0 ${allowContentOverflow ? "p-3 flex-shrink-0 overflow-visible" : scrollContent ? "p-4 overflow-y-auto overflow-x-hidden flex-1 min-h-0" : "p-3 flex-shrink-0 overflow-hidden"}`}
        >
          {children}
        </div>

        {footer != null && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl flex justify-end flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
