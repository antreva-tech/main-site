"use client";

/**
 * Renders a single ticket comment. Edit and Delete are shown only for the current user's own comments.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { updateComment, deleteComment } from "../actions";

type Comment = {
  id: string;
  content: string;
  authorId: string | null;
  authorType: string;
  createdAt: Date;
  author: { name: string } | null;
};

export function TicketCommentItem({
  comment,
  currentUserId,
  isOriginalComment = false,
}: {
  comment: Comment;
  currentUserId: string | null;
  /** When true, Delete is hidden and server will reject delete (first comment on the ticket). */
  isOriginalComment?: boolean;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canEdit =
    currentUserId &&
    comment.authorId === currentUserId &&
    comment.authorType === "staff";

  const handleSave = () => {
    if (editContent.trim() === comment.content) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      await updateComment(comment.id, editContent);
      setEditing(false);
      router.refresh();
    });
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setEditing(false);
  };

  const handleDeleteConfirm = () => {
    startTransition(async () => {
      await deleteComment(comment.id);
      setShowDeleteConfirm(false);
      router.refresh();
    });
  };

  return (
    <div
      className={`p-4 rounded-lg ${
        comment.authorType === "system"
          ? "bg-gray-50 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-600"
          : "bg-blue-50 dark:bg-[#1C6ED5]/10 border border-blue-100 dark:border-[#1C6ED5]/30"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {comment.author?.name || "System"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {comment.createdAt.toLocaleString()}
          </span>
          {canEdit && !editing && (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs font-medium text-[#1C6ED5] hover:text-[#1559B3]"
              >
                {t.dashboard.common.edit}
              </button>
              {!isOriginalComment && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  {t.dashboard.tickets.deleteComment}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1C6ED5] resize-none disabled:opacity-50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {t.dashboard.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !editContent.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#1C6ED5] rounded-lg hover:bg-[#1559B3] disabled:opacity-50"
            >
              {isPending ? "…" : t.dashboard.common.save}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
      )}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t.dashboard.tickets.deleteCommentConfirmTitle}
        message={t.dashboard.tickets.deleteCommentConfirmMessage}
        confirmLabel={t.dashboard.tickets.deleteComment}
        onConfirm={handleDeleteConfirm}
        danger
      />
    </div>
  );
}
