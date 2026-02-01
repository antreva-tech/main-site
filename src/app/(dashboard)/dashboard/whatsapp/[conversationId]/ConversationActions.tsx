/**
 * Conversation Actions Component
 */

"use client";

import { useState, useTransition } from "react";
import { createLeadFromConversation } from "./actions";

export function ConversationActions({
  conversationId,
  waId,
  isLinked,
}: {
  conversationId: string;
  waId: string;
  isLinked: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCreateLead = () => {
    startTransition(async () => {
      await createLeadFromConversation(conversationId, waId);
      setShowMenu(false);
    });
  };

  if (isLinked) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
      >
        Actions ▾
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <button
            onClick={handleCreateLead}
            disabled={isPending}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Lead"}
          </button>
        </div>
      )}
    </div>
  );
}
