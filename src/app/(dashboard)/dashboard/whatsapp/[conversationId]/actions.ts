/**
 * Server Actions for WhatsApp Conversation
 */

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendTextMessage } from "@/lib/whatsapp";
import { logCreate } from "@/lib/audit";

/**
 * Sends a message in a conversation.
 */
export async function sendMessage(
  conversationId: string,
  phoneNumberId: string,
  toNumber: string,
  body: string
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Send via WhatsApp API
  const result = await sendTextMessage(phoneNumberId, toNumber, body);

  // Store outbound message
  await prisma.whatsAppMessage.create({
    data: {
      conversationId,
      wamid: result.messageId,
      direction: "outbound",
      type: "text",
      content: { text: { body } },
      status: "sent",
      timestamp: new Date(),
    },
  });

  // Update conversation last message time
  await prisma.whatsAppConversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath(`/dashboard/whatsapp/${conversationId}`);
}

/**
 * Creates a lead from an unknown conversation.
 */
export async function createLeadFromConversation(
  conversationId: string,
  waId: string
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Create lead with WhatsApp as source
  const lead = await prisma.lead.create({
    data: {
      name: `WhatsApp ${formatPhoneDisplay(waId)}`,
      phone: `+${waId}`,
      source: "whatsapp",
      stage: "new",
    },
  });

  // Link conversation to lead
  await prisma.whatsAppConversation.update({
    where: { id: conversationId },
    data: { leadId: lead.id },
  });

  await logCreate(session.id, "lead", lead.id, {
    source: "whatsapp",
    conversationId,
  });

  revalidatePath(`/dashboard/whatsapp/${conversationId}`);
  revalidatePath("/dashboard/pipeline");
  return lead;
}

function formatPhoneDisplay(waId: string): string {
  return waId.slice(-4);
}
