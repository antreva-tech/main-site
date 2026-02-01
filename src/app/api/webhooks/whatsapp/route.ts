/**
 * WhatsApp Webhook Handler
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import type { WebhookPayload, WebhookChange } from "@/lib/whatsapp";

/**
 * GET: Webhook verification (required by Meta).
 * Meta sends hub.mode, hub.verify_token, and hub.challenge.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("WhatsApp webhook verification failed");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST: Handle incoming webhook events.
 * Must respond 200 within 1 second to avoid retries.
 */
export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json();

    // Validate it's from WhatsApp Business
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Invalid object type" }, { status: 400 });
    }

    // Process in background (respond quickly)
    processWebhookAsync(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * Process webhook payload asynchronously.
 */
async function processWebhookAsync(payload: WebhookPayload) {
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field === "messages") {
        await handleMessagesChange(change);
      }
    }
  }
}

/**
 * Handle messages/statuses from webhook.
 */
async function handleMessagesChange(change: WebhookChange) {
  const { metadata, contacts, messages, statuses } = change.value;
  const phoneNumberId = metadata.phone_number_id;

  // Handle incoming messages
  if (messages && messages.length > 0) {
    for (const message of messages) {
      await handleIncomingMessage(phoneNumberId, message, contacts?.[0]);
    }
  }

  // Handle status updates (sent, delivered, read)
  if (statuses && statuses.length > 0) {
    for (const status of statuses) {
      await handleStatusUpdate(status);
    }
  }
}

/**
 * Handle an incoming message.
 */
async function handleIncomingMessage(
  phoneNumberId: string,
  message: {
    from: string;
    id: string;
    timestamp: string;
    type: string;
    text?: { body: string };
  },
  contact?: { profile: { name: string }; wa_id: string }
) {
  try {
    // Find or create WhatsApp phone
    let waPhone = await prisma.whatsAppPhone.findUnique({
      where: { phoneNumberId },
    });

    if (!waPhone) {
      // Auto-create phone entry (should be pre-configured ideally)
      waPhone = await prisma.whatsAppPhone.create({
        data: {
          phoneNumberId,
          displayPhoneNumber: phoneNumberId,
          isActive: true,
        },
      });
    }

    // Find or create conversation
    let conversation = await prisma.whatsAppConversation.findFirst({
      where: {
        whatsAppPhoneId: waPhone.id,
        waId: message.from,
      },
    });

    if (!conversation) {
      conversation = await prisma.whatsAppConversation.create({
        data: {
          whatsAppPhoneId: waPhone.id,
          waId: message.from,
          lastMessageAt: new Date(),
        },
      });
    }

    // Build message content (Prisma Json type)
    const content = JSON.parse(
      JSON.stringify({
        type: message.type,
        ...(message.text && { text: message.text }),
      })
    );

    // Store message
    await prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        wamid: message.id,
        direction: "inbound",
        type: message.type,
        content,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
      },
    });

    // Update conversation last message time
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Log to audit
    await logAction({
      userId: null,
      entityType: "whatsapp",
      entityId: conversation.id,
      action: "create",
      metadata: {
        context: {
          from: message.from,
          type: message.type,
          wamid: message.id,
        },
      },
    });
  } catch (error) {
    console.error("Error handling incoming message:", error);
  }
}

/**
 * Handle a status update (sent, delivered, read).
 */
async function handleStatusUpdate(status: {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
}) {
  try {
    // Update message status by wamid
    await prisma.whatsAppMessage.updateMany({
      where: { wamid: status.id },
      data: { status: status.status },
    });
  } catch (error) {
    console.error("Error handling status update:", error);
  }
}
