"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  tier: "START" | "PRO" | "PREMIUM";
  price: string;
  priceNote?: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

interface PlanCardProps {
  /** Plan data to display */
  plan: Plan;
}

/**
 * Plan card component - Mobile-first design
 * Displays individual plan with features and pricing
 * Highlighted plans get a distinct visual treatment (no scale on mobile)
 * Supports Spanish/English translations
 */
export function PlanCard({ plan }: PlanCardProps) {
  const { t } = useLanguage();
  const isHighlighted = plan.highlighted;

  return (
    <div
      className={`relative rounded-2xl p-5 sm:p-6 lg:p-8 transition-all ${
        isHighlighted
          ? "bg-midnight-navy text-white shadow-2xl border-2 border-tech-blue md:scale-105"
          : "bg-white text-midnight-navy shadow-lg border border-slate-gray/20 hover:shadow-xl"
      }`}
    >
      {/* Highlighted badge */}
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tech-blue text-white text-xs font-bold px-3 sm:px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
          {t.plans.mostPopular}
        </span>
      )}

      {/* Plan header */}
      <div className="text-center mb-5 sm:mb-6">
        <span
          className={`text-xs sm:text-sm font-medium tracking-wider uppercase ${
            isHighlighted ? "text-tech-blue" : "text-slate-gray"
          }`}
        >
          {plan.tier}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold mt-1">{plan.name}</h3>
        <p
          className={`mt-2 text-sm ${
            isHighlighted ? "text-slate-gray/80" : "text-slate-gray"
          }`}
        >
          {plan.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-5 sm:mb-6">
        <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
        {plan.priceNote && (
          <span
            className={`block text-sm mt-1 ${
              isHighlighted ? "text-slate-gray/80" : "text-slate-gray"
            }`}
          >
            {plan.priceNote}
          </span>
        )}
      </div>

      {/* Features list */}
      <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5 sm:gap-3">
            {feature.included ? (
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0 text-tech-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isHighlighted ? "text-slate-gray/50" : "text-slate-gray/40"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span
              className={`text-sm sm:text-base ${
                feature.included
                  ? ""
                  : isHighlighted
                    ? "text-slate-gray/50"
                    : "text-slate-gray/60"
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href="#contact"
        className={`block w-full py-3.5 sm:py-3 rounded-lg font-medium text-center transition-colors ${
          isHighlighted
            ? "bg-tech-blue text-white hover:bg-tech-blue/90 active:bg-tech-blue/80"
            : "bg-midnight-navy text-white hover:bg-midnight-navy/90 active:bg-midnight-navy/80"
        }`}
      >
        {t.nav.getStarted}
      </a>
    </div>
  );
}

export default PlanCard;
