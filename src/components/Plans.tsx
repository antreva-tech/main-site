"use client";

import React from "react";
import PlanCard from "./PlanCard";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Plans section component - Mobile-first design
 * Features subtle background pattern and gradient accents
 * Supports Spanish/English translations
 */
export function Plans() {
  const { t } = useLanguage();

  const plans = [
    {
      id: "start",
      tier: "START" as const,
      name: t.plans.start.name,
      description: t.plans.start.description,
      price: "RD$4,500",
      priceNote: t.plans.perMonth,
      features: [
        { text: t.plans.features.whatsappSetup, included: true },
        { text: t.plans.features.digitalMenu, included: true },
        { text: t.plans.features.basicWebsite, included: true },
        { text: t.plans.features.instagramOpt, included: true },
        { text: t.plans.features.monthlySupport, included: true },
        { text: t.plans.features.advancedWhatsapp, included: false },
        { text: t.plans.features.contentCreation, included: false },
        { text: t.plans.features.digitalCampaigns, included: false },
      ],
    },
    {
      id: "pro",
      tier: "PRO" as const,
      name: t.plans.pro.name,
      description: t.plans.pro.description,
      price: "RD$7,500",
      priceNote: t.plans.perMonth,
      highlighted: true,
      features: [
        { text: t.plans.features.everythingStart, included: true },
        { text: t.plans.features.whatsappAutomation, included: true },
        { text: t.plans.features.monthlyContent, included: true },
        { text: t.plans.features.websiteOrderForm, included: true },
        { text: t.plans.features.basicSecurity, included: true },
        { text: t.plans.features.digitalCampaigns, included: false },
        { text: t.plans.features.multiPageWebsite, included: false },
        { text: t.plans.features.securityMonitoring, included: false },
      ],
    },
    {
      id: "premium",
      tier: "PREMIUM" as const,
      name: t.plans.premium.name,
      description: t.plans.premium.description,
      price: "RD$12,000+",
      priceNote: t.plans.perMonth,
      features: [
        { text: t.plans.features.everythingPro, included: true },
        { text: t.plans.features.semiAutomatedWa, included: true },
        { text: t.plans.features.campaignSetup, included: true },
        { text: t.plans.features.multiPageWebsite, included: true },
        { text: t.plans.features.reinforcedSecurity, included: true },
        { text: t.plans.features.securityMonitoring, included: true },
        { text: t.plans.features.prioritySupport, included: true },
        { text: t.plans.features.customIntegrations, included: true },
      ],
    },
  ];

  return (
    <section
      id="plans"
      className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-tech-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-midnight-navy/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-block text-tech-blue font-medium text-xs sm:text-sm tracking-wider uppercase bg-tech-blue/10 px-3 py-1 rounded-full">
            {t.plans.tagline}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-midnight-navy mt-3">
            {t.plans.title}
          </h2>
          <p className="text-slate-gray/80 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            {t.plans.description}
          </p>
        </div>

        {/* Plans grid */}
        <div className="flex flex-col gap-6 sm:gap-8 md:grid md:grid-cols-3 md:items-start">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="inline-block bg-white/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-sm border border-slate-gray/20">
            <p className="text-midnight-navy/80 text-sm sm:text-base">
              {t.plans.allPlansInclude}
            </p>
            <p className="text-midnight-navy/70 mt-1 text-sm sm:text-base">
              {t.plans.needCustom}{" "}
              <a
                href="#contact"
                className="text-tech-blue hover:underline active:underline font-medium"
              >
                {t.plans.contactUs}
              </a>{" "}
              {t.plans.forTailored}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Plans;
