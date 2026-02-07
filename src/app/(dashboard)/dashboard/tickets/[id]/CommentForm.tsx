/**
 * Comment Form Component
 * Supports text and optional multiple image uploads.
 */

"use client";

import { useRef, useState, useTransition } from "react";
import { addComment } from "../actions";
import { useLanguage } from "@/contexts/LanguageContext";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const hasContent = (formData.get("content") as string)?.trim();
    const files = formData.getAll("attachments").filter((f): f is File => f instanceof File);
    if (!hasContent && files.length === 0) return;

    startTransition(async () => {
      await addComment(ticketId, formData);
      setContent("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t.dashboard.tickets.addCommentPlaceholder}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#1C6ED5] resize-none"
      />
      <div className="mt-2 flex flex-col gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t.dashboard.tickets.attachImages}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            name="attachments"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#1C6ED5]/10 file:text-[#1C6ED5] file:font-medium"
          />
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {t.dashboard.tickets.attachImagesHint}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition disabled:opacity-50 text-sm"
          >
            {isPending ? t.dashboard.tickets.sending : t.dashboard.tickets.addComment}
          </button>
        </div>
      </div>
    </form>
  );
}
