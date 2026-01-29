"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Footer component - Mobile-first design
 * Dark theme with decorative elements
 * WhatsApp as primary contact method
 * Supports Spanish/English translations
 */
export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer
      id="contact"
      className="relative bg-midnight-navy text-white overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-tech-blue/30 to-transparent" />
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-tech-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-tech-blue/5 rounded-full blur-3xl" />

      {/* Contact Section */}
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          {t.footer.title}
        </h2>
        <p className="text-slate-gray max-w-md mx-auto text-sm sm:text-base mt-4">
          {t.footer.description}
        </p>

        {/* WhatsApp CTA Button */}
        <a
          href="https://wa.me/18093557925?text=Hola%2C%20me%20gustar%C3%ADa%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios%20de%20ANTREVA%20Tech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mt-8 px-8 py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-500/25"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-base sm:text-lg">{t.footer.whatsappCta}</span>
        </a>

        {/* Location */}
        <div className="flex items-center gap-3 justify-center mt-8 text-slate-gray">
          <svg
            className="w-5 h-5 text-tech-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm sm:text-base">{t.footer.location}</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <Image
              src="/Antreva Tech Transparente.png"
              alt="Antreva Tech"
              width={180}
              height={45}
              className="h-10 sm:h-12 w-auto"
            />
            <p className="text-slate-gray text-xs sm:text-sm text-center">
              &copy; {currentYear} Antreva Tech. {t.footer.rights}
            </p>
            <span className="text-slate-gray text-xs sm:text-sm hidden md:block">
              {t.hero.tagline}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
