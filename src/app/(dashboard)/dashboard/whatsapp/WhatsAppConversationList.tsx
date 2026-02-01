/**
 * WhatsApp Inbox — Conversation list with brand-aligned styling.
 * Displays conversation rows with avatar, name, badges, last message preview, and time.
 */

"use client";

import Link from "next/link";

/** Serialized last message for client-safe props */
export interface SerializedLastMessage {
  content: unknown;
  direction: string;
  createdAt: string;
}

/** Serialized conversation for client component */
export interface SerializedConversation {
  id: string;
  waId: string;
  lastMessageAt: string | null;
  clientId: string | null;
  leadId: string | null;
  client?: { id: string; name: string } | null;
  lead?: { id: string; name: string } | null;
  messages: SerializedLastMessage[];
}

export interface WhatsAppConversationListProps {
  conversations: SerializedConversation[];
  labels: {
    youPrefix: string;
    noMessages: string;
    unknown: string;
    client: string;
    lead: string;
    yesterday: string;
  };
}

/**
 * Formats a phone number for display (US/Canada +1 or generic +prefix).
 */
function formatPhoneNumber(waId: string): string {
  if (waId.startsWith("1")) {
    return `+1 ${waId.slice(1, 4)} ${waId.slice(4, 7)} ${waId.slice(7)}`;
  }
  return `+${waId}`;
}

/**
 * Returns a short preview string from WhatsApp message content.
 */
function getMessagePreview(content: unknown): string {
  const c = content as Record<string, unknown>;
  if (c.text && typeof c.text === "object") {
    return (c.text as { body: string }).body;
  }
  if (c.type === "image") return "[Image]";
  if (c.type === "audio") return "[Audio]";
  if (c.type === "video") return "[Video]";
  if (c.type === "document") return "[Document]";
  return "[Message]";
}

/**
 * Formats a timestamp for list display (time, Yesterday, weekday, or date).
 */
function formatTime(
  dateIso: string,
  yesterdayLabel: string
): string {
  const date = new Date(dateIso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) return yesterdayLabel;
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * Renders the list of WhatsApp conversations with avatars, badges, and last message.
 */
export function WhatsAppConversationList({
  conversations,
  labels,
}: WhatsAppConversationListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#8A8F98]/20 bg-white shadow-sm">
      <ul className="divide-y divide-[#8A8F98]/15" role="list">
        {conversations.map((conv) => {
          const lastMessage = conv.messages[0];
          const displayName =
            conv.client?.name ||
            conv.lead?.name ||
            formatPhoneNumber(conv.waId);
          const isLinked = conv.clientId || conv.leadId;

          return (
            <li key={conv.id}>
              <Link
                href={`/dashboard/whatsapp/${conv.id}`}
                className="flex items-center gap-4 p-4 transition hover:bg-[#0B132B]/[0.03] focus:outline-none focus:ring-2 focus:ring-[#1C6ED5] focus:ring-inset"
              >
                {/* Avatar — WhatsApp green with initial */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-base font-semibold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium text-[#0B132B]">
                      {displayName}
                    </span>
                    {!isLinked && (
                      <span className="rounded-md bg-[#8A8F98]/15 px-2 py-0.5 text-xs font-medium text-[#8A8F98]">
                        {labels.unknown}
                      </span>
                    )}
                    {conv.client && (
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {labels.client}
                      </span>
                    )}
                    {conv.lead && !conv.client && (
                      <span className="rounded-md bg-[#1C6ED5]/15 px-2 py-0.5 text-xs font-medium text-[#1C6ED5]">
                        {labels.lead}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="mt-1 truncate text-sm text-[#8A8F98]">
                      {lastMessage.direction === "outbound" && labels.youPrefix}
                      {getMessagePreview(lastMessage.content)}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-xs text-[#8A8F98]">
                  {conv.lastMessageAt
                    ? formatTime(conv.lastMessageAt, labels.yesterday)
                    : labels.noMessages}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
