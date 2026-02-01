/**
 * Message Input Component
 */

"use client";

import { useState, useTransition } from "react";
import { sendMessage } from "./actions";

export function MessageInput({
  conversationId,
  phoneNumberId,
  toNumber,
}: {
  conversationId: string;
  phoneNumberId: string;
  toNumber: string;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    startTransition(async () => {
      await sendMessage(conversationId, phoneNumberId, toNumber, message);
      setMessage("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-t border-gray-200 p-3 sm:p-4 flex gap-2"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 min-w-0 px-4 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || !message.trim()}
        className="px-5 sm:px-6 py-2.5 sm:py-2 min-h-[44px] bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition disabled:opacity-50 text-sm font-medium flex-shrink-0"
      >
        {isPending ? "..." : "Send"}
      </button>
    </form>
  );
}
