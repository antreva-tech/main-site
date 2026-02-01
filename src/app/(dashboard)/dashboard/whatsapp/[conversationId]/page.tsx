/**
 * WhatsApp Conversation Thread Page
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MessageInput } from "./MessageInput";
import { ConversationActions } from "./ConversationActions";

/**
 * Conversation thread page.
 */
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const conversation = await prisma.whatsAppConversation.findUnique({
    where: { id: conversationId },
    include: {
      whatsAppPhone: { select: { phoneNumberId: true, displayPhoneNumber: true } },
      lead: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { timestamp: "asc" },
        select: {
          id: true,
          direction: true,
          type: true,
          content: true,
          status: true,
          timestamp: true,
        },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  const displayName =
    conversation.client?.name ||
    conversation.lead?.name ||
    formatPhoneNumber(conversation.waId);

  return (
    <div className="flex flex-col min-h-[50vh] h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <Link
            href="/dashboard/whatsapp"
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            ←
          </Link>
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#25D366] flex items-center justify-center text-white font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 truncate">{displayName}</h1>
            <p className="text-sm text-gray-500 truncate">
              {formatPhoneNumber(conversation.waId)}
            </p>
          </div>
        </div>

        {/* Link Info + Actions: wrap on small screens */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-shrink-0">
          {conversation.client && (
            <Link
              href={`/dashboard/clients/${conversation.client.id}`}
              className="text-sm text-[#1C6ED5] hover:underline"
            >
              View Client →
            </Link>
          )}
          {conversation.lead && !conversation.client && (
            <Link
              href={`/dashboard/pipeline/${conversation.lead.id}`}
              className="text-sm text-[#1C6ED5] hover:underline"
            >
              View Lead →
            </Link>
          )}
          <ConversationActions
            conversationId={conversation.id}
            waId={conversation.waId}
            isLinked={!!(conversation.clientId || conversation.leadId)}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {conversation.messages.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No messages in this conversation yet.
          </p>
        )}
      </div>

      {/* Input */}
      <MessageInput
        conversationId={conversation.id}
        phoneNumberId={conversation.whatsAppPhone.phoneNumberId}
        toNumber={conversation.waId}
      />
    </div>
  );
}

/**
 * Message bubble component.
 */
function MessageBubble({
  message,
}: {
  message: {
    id: string;
    direction: string;
    type: string;
    content: unknown;
    status: string | null;
    timestamp: Date;
  };
}) {
  const isOutbound = message.direction === "outbound";
  const content = message.content as Record<string, unknown>;
  const textBody =
    content.text && typeof content.text === "object"
      ? (content.text as { body: string }).body
      : null;

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOutbound
            ? "bg-[#DCF8C6] text-gray-900"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        {textBody ? (
          <p className="whitespace-pre-wrap">{textBody}</p>
        ) : (
          <p className="text-gray-500 italic">[{message.type}]</p>
        )}

        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isOutbound && message.status && (
            <StatusIcon status={message.status} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Status icon for outbound messages.
 */
function StatusIcon({ status }: { status: string }) {
  const icons: Record<string, string> = {
    sent: "✓",
    delivered: "✓✓",
    read: "✓✓",
    failed: "!",
  };

  const colors: Record<string, string> = {
    sent: "text-gray-400",
    delivered: "text-gray-400",
    read: "text-blue-500",
    failed: "text-red-500",
  };

  return (
    <span className={`text-xs ${colors[status] || colors.sent}`}>
      {icons[status] || ""}
    </span>
  );
}

function formatPhoneNumber(waId: string): string {
  if (waId.startsWith("1")) {
    return `+1 ${waId.slice(1, 4)} ${waId.slice(4, 7)} ${waId.slice(7)}`;
  }
  return `+${waId}`;
}
