"use client";

import React from "react";
import PlanCard from "./PlanCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPlanPrice } from "@/lib/pricing";

/**
 * Plans section component - Mobile-first design
 * Features subtle background pattern and gradient accents
 * Spanish: RD$; English: USD (converted from DOP)
 */
export function Plans() {
  const { t, currencyLocale } = useLanguage();
  const currency = currencyLocale === "en" ? "USD" : "DOP";

  const plans = [
    {
      id: "start",
      tier: "START" as const,
      name: t.plans.start.name,
      description: t.plans.start.description,
      price: formatPlanPrice(4500, currency),
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
      price: formatPlanPrice(7500, currency),
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
      price: formatPlanPrice(12000, currency, { plus: true }),
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

        {/* Short disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-midnight-navy/80 text-sm sm:text-base">
            {t.plans.allPlansInclude}
          </p>
        </div>

        {/* Custom solution CTA — prominent section below plans */}
        {(() => {
          const custom = t.plans?.customSection;
          const title = custom?.title ?? t.plans?.needCustom;
          const description = custom?.description;
          const cta = custom?.cta ?? `${t.plans?.contactUs} ${t.plans?.forTailored}`.trim();
          return (
            <div className="mt-10 sm:mt-14">
              <div
                className="relative rounded-2xl overflow-hidden bg-midnight-navy text-white px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16"
                aria-labelledby="custom-solution-heading"
              >
                <div className="absolute inset-0 bg-tech-blue/10" aria-hidden="true" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-tech-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
                <div className="relative max-w-2xl mx-auto text-center">
                  <h2
                    id="custom-solution-heading"
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-white"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-4 text-white/85 text-sm sm:text-base leading-relaxed">
                      {description}
                    </p>
                  )}
                  <a
                    href="#contact"
                    className="mt-8 inline-flex items-center justify-center rounded-lg bg-tech-blue text-white font-semibold px-6 py-3.5 text-sm sm:text-base hover:bg-tech-blue/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-midnight-navy transition-colors"
                  >
                    {cta}
                  </a>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}

export default Plans;
