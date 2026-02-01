/**
 * Comment Form Component
 */

"use client";

import { useState, useTransition } from "react";
import { addComment } from "../actions";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      await addComment(ticketId, content);
      setContent("");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C6ED5] resize-none"
      />
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="px-4 py-2 bg-[#1C6ED5] text-white rounded-lg hover:bg-[#1559B3] transition disabled:opacity-50 text-sm"
        >
          {isPending ? "Sending..." : "Add Comment"}
        </button>
      </div>
    </form>
  );
}
