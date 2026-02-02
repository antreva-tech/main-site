/**
 * WhatsApp Inbox — Client view: title, empty state or conversation list.
 * Uses LanguageContext for i18n and composes WhatsAppEmptyState and WhatsAppConversationList.
 */

"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { WhatsAppConversationList } from "./WhatsAppConversationList";
import type { SerializedConversation } from "./WhatsAppConversationList";
import { WhatsAppEmptyState } from "./WhatsAppEmptyState";

export interface WhatsAppInboxViewProps {
  conversations: SerializedConversation[];
}

/**
 * Renders the WhatsApp inbox: translated title, then either empty state or conversation list.
 */
export function WhatsAppInboxView({ conversations }: WhatsAppInboxViewProps) {
  const { t } = useLanguage();
  const whatsapp = t.dashboard.whatsapp;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-[#0B132B] sm:text-3xl">
          {whatsapp.title}
        </h1>
        <p className="mt-1 text-sm text-[#8A8F98]">
          Reply to customers and link conversations to leads or clients.
        </p>
      </header>

      {conversations.length === 0 ? (
        <WhatsAppEmptyState
          headline={whatsapp.emptyHeadline}
          description={whatsapp.emptyDescription}
          ctaLabel={whatsapp.emptyCta}
          ctaHref="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
          ctaExternal
        />
      ) : (
        <WhatsAppConversationList
          conversations={conversations}
          labels={{
            youPrefix: whatsapp.youPrefix,
            noMessages: whatsapp.noMessages,
            unknown: whatsapp.unknown,
            client: whatsapp.client,
            lead: whatsapp.lead,
            yesterday: whatsapp.yesterday,
          }}
        />
      )}
    </div>
  );
}
