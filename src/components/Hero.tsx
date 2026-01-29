"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Hero section component
 * Mobile-first design with decorative background elements
 * Supports Spanish/English translations
 */
export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative min-h-0 md:min-h-screen flex items-start md:items-center pt-14 sm:pt-16 lg:pt-20 overflow-hidden bg-white"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-tech-blue/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-midnight-navy/5 to-transparent" />

      {/* Animated blobs */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-tech-blue/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-midnight-navy/10 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative w-full max-w-7xl mx-auto px-4 pt-10 pb-52 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-16 sm:gap-8 md:grid md:grid-cols-2 md:gap-10 md:items-center">
          {/* Logo as Hero Image - First on mobile, second on desktop */}
          <div className="flex justify-center md:justify-end md:order-2">
            <Image
              src="/Antreva Tech Transparente.png"
              alt="Antreva Tech"
              width={500}
              height={400}
              sizes="(max-width: 640px) 384px, (max-width: 768px) 384px, (max-width: 1024px) 448px, 512px"
              quality={82}
              priority
              className="w-full max-w-sm sm:max-w-sm md:max-w-md lg:max-w-lg"
            />
          </div>

          {/* Content - Second on mobile, first on desktop */}
          <div className="space-y-4 sm:space-y-5 text-center md:text-left md:order-1">
            <span className="inline-block text-tech-blue font-medium text-xs sm:text-sm tracking-wider uppercase bg-tech-blue/10 px-3 py-1 rounded-full">
              {t.hero.tagline}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-midnight-navy leading-tight">
              {t.hero.title}{" "}
              <span className="text-tech-blue">{t.hero.titleHighlight}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-gray max-w-lg mx-auto md:mx-0">
              {t.hero.description}
            </p>
            <p className="text-sm text-slate-gray/90 max-w-lg mx-auto md:mx-0" aria-label="About Antreva Tech">
              {t.hero.about}
            </p>
            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4 sm:justify-center md:justify-start">
              <a
                href="#plans"
                className="w-full sm:w-auto bg-tech-blue text-white px-6 py-3.5 sm:px-8 sm:py-3 rounded-lg hover:bg-tech-blue/90 active:bg-tech-blue/80 transition-colors font-medium text-center shadow-lg shadow-tech-blue/25"
              >
                {t.hero.viewPlans}
              </a>
              <a
                href="#contact"
                className="w-full sm:w-auto border-2 border-midnight-navy text-midnight-navy px-6 py-3.5 sm:px-8 sm:py-3 rounded-lg hover:bg-midnight-navy hover:text-white active:bg-midnight-navy/90 transition-colors font-medium text-center"
              >
                {t.hero.contactUs}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
