"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Custom Services section - Mobile-first design
 * Features gradient background and decorative elements
 * Supports Spanish/English translations
 */
export function CustomServices() {
  const { t } = useLanguage();

  const addOns = [
    t.addOns.photography,
    t.addOns.adsManagement,
    t.addOns.extraContent,
    t.addOns.extraPages,
    t.addOns.extraSecurity,
  ];

  const services = [
    {
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      title: t.services.softwareDev,
      desc: t.services.softwareDevDesc,
    },
    {
      icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      title: t.services.aiSolutions,
      desc: t.services.aiSolutionsDesc,
    },
    {
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      title: t.services.cybersecurity,
      desc: t.services.cybersecurityDesc,
    },
    {
      icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
      title: t.services.cloudSolutions,
      desc: t.services.cloudSolutionsDesc,
    },
  ];

  return (
    <section
      id="services"
      className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-midnight-navy via-midnight-navy to-midnight-navy/95 text-white overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-blue/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-blue/50 to-transparent" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-tech-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-tech-blue/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          {/* Content */}
          <div className="space-y-4 sm:space-y-5 text-center md:text-left">
            <span className="inline-block text-tech-blue font-medium text-xs sm:text-sm tracking-wider uppercase">
              {t.services.tagline}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {t.services.title}
            </h2>
            <p className="text-slate-gray text-sm sm:text-base">
              {t.services.description}
            </p>

            {/* Add-ons list */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-white text-sm sm:text-base">
                {t.services.addOnsTitle}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {addOns.map((addon, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 justify-center md:justify-start"
                  >
                    <svg
                      className="w-5 h-5 text-tech-blue flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="text-slate-gray text-sm sm:text-base">
                      {addon}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="pt-2 sm:pt-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-tech-blue font-medium hover:gap-3 active:gap-3 transition-all text-sm sm:text-base"
              >
                {t.services.discussProject}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Custom Solutions illustration */}
          <div className="hidden sm:flex justify-center md:justify-end">
            <div className="relative w-full max-w-xs md:max-w-md min-h-[280px] md:min-h-[350px]">
              <div className="absolute -inset-2 bg-tech-blue/20 rounded-2xl blur-lg" />
              <Image
                src="/solutions.png"
                alt="Custom Solutions - software, cloud, security, analytics"
                width={450}
                height={350}
                sizes="(max-width: 640px) 320px, (max-width: 768px) 384px, 448px"
                quality={75}
                loading="lazy"
                className="relative rounded-xl w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Service categories */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-5 sm:p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-tech-blue/30 active:bg-white/10 transition-all group"
            >
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-tech-blue mb-3 sm:mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={service.icon}
                />
              </svg>
              <h3 className="font-semibold text-white group-hover:text-tech-blue transition-colors text-sm sm:text-base">
                {service.title}
              </h3>
              <p className="text-slate-gray text-xs sm:text-sm mt-1">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CustomServices;
