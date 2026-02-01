/**
 * WhatsApp Inbox Page
 * Shows conversations grouped by contact.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * WhatsApp inbox page.
 */
export default async function WhatsAppInboxPage() {
  const conversations = await prisma.whatsAppConversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 50,
    include: {
      lead: { select: { id: true, name: true } },
      client: { select: { id: true, name: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          content: true,
          direction: true,
          createdAt: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">WhatsApp Inbox</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y">
        {conversations.map((conv) => {
          const lastMessage = conv.messages[0];
          const displayName =
            conv.client?.name || conv.lead?.name || formatPhoneNumber(conv.waId);
          const isLinked = conv.clientId || conv.leadId;

          return (
            <Link
              key={conv.id}
              href={`/dashboard/whatsapp/${conv.id}`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white font-medium">
                {displayName.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">
                    {displayName}
                  </p>
                  {!isLinked && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                      Unknown
                    </span>
                  )}
                  {conv.client && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      Client
                    </span>
                  )}
                  {conv.lead && !conv.client && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                      Lead
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {lastMessage.direction === "outbound" && "You: "}
                    {getMessagePreview(lastMessage.content)}
                  </p>
                )}
              </div>

              {/* Time */}
              <div className="text-xs text-gray-400 flex-shrink-0">
                {conv.lastMessageAt
                  ? formatTime(conv.lastMessageAt)
                  : "No messages"}
              </div>
            </Link>
          );
        })}

        {conversations.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No conversations yet. Messages will appear here when customers contact
            you via WhatsApp.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Formats a phone number for display.
 */
function formatPhoneNumber(waId: string): string {
  // Basic formatting - add country code prefix
  if (waId.startsWith("1")) {
    // US/Canada
    return `+1 ${waId.slice(1, 4)} ${waId.slice(4, 7)} ${waId.slice(7)}`;
  }
  return `+${waId}`;
}

/**
 * Gets a preview of message content.
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
 * Formats a timestamp for display.
 */
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
