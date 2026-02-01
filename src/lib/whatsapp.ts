/**
 * WhatsApp Business Cloud API Client
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";

/**
 * Gets the WhatsApp access token from environment or database.
 */
function getAccessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not set");
  }
  return token;
}

/**
 * Send a text message via WhatsApp.
 * @param phoneNumberId - Meta phone number ID (from WhatsAppPhone)
 * @param to - Recipient phone number in E.164 format
 * @param body - Message text
 * @returns Message response with wamid
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages
 */
export async function sendTextMessage(
  phoneNumberId: string,
  to: string,
  body: string
): Promise<{ messageId: string }> {
  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `WhatsApp API error: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return { messageId: data.messages[0].id };
}

/**
 * Send a template message via WhatsApp.
 * Templates must be pre-approved by Meta.
 * @param phoneNumberId - Meta phone number ID
 * @param to - Recipient phone number
 * @param templateName - Approved template name
 * @param languageCode - Template language (e.g., "en_US", "es")
 * @param components - Optional template components (header, body, buttons)
 * @see https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
 */
export async function sendTemplateMessage(
  phoneNumberId: string,
  to: string,
  templateName: string,
  languageCode: string = "en_US",
  components?: unknown[]
): Promise<{ messageId: string }> {
  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `WhatsApp API error: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return { messageId: data.messages[0].id };
}

/**
 * Mark a message as read.
 * @param phoneNumberId - Meta phone number ID
 * @param messageId - wamid of the message to mark as read
 */
export async function markMessageAsRead(
  phoneNumberId: string,
  messageId: string
): Promise<void> {
  await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}

/**
 * WhatsApp webhook payload types.
 */
export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: Array<{
      profile: { name: string };
      wa_id: string;
    }>;
    messages?: Array<{
      from: string;
      id: string;
      timestamp: string;
      type: string;
      text?: { body: string };
      image?: { id: string; mime_type: string };
      audio?: { id: string; mime_type: string };
      video?: { id: string; mime_type: string };
      document?: { id: string; filename: string; mime_type: string };
    }>;
    statuses?: Array<{
      id: string;
      status: "sent" | "delivered" | "read" | "failed";
      timestamp: string;
      recipient_id: string;
    }>;
  };
  field: string;
}

/**
 * Verifies a webhook signature from Meta.
 * @param signature - X-Hub-Signature-256 header value
 * @param body - Raw request body
 * @returns True if signature is valid
 */
export function verifyWebhookSignature(
  signature: string | null,
  body: string
): boolean {
  if (!signature) return false;

  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn("WHATSAPP_APP_SECRET not set, skipping signature verification");
    return true;
  }

  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");

  return signature === `sha256=${expectedSignature}`;
}
