/**
 * WhatsApp Inbox Page
 * Server component: fetches conversations, passes serialized data to WhatsAppInboxView (client).
 */

import { prisma } from "@/lib/prisma";
import { WhatsAppInboxView } from "./WhatsAppInboxView";
import type { SerializedConversation } from "./WhatsAppConversationList";

/**
 * WhatsApp inbox page: loads conversations and renders client view with empty state or list.
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

  const serialized: SerializedConversation[] = conversations.map((conv) => ({
    id: conv.id,
    waId: conv.waId,
    lastMessageAt: conv.lastMessageAt?.toISOString() ?? null,
    clientId: conv.clientId,
    leadId: conv.leadId,
    client: conv.client,
    lead: conv.lead,
    messages: conv.messages.map((m) => ({
      content: m.content,
      direction: m.direction,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return <WhatsAppInboxView conversations={serialized} />;
}
