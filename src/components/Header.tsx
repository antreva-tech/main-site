"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Header component - Mobile-first responsive navigation
 * Full-screen mobile menu with large touch targets
 * Includes language switcher
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { href: "#services", label: t.nav.services },
    { href: "#plans", label: t.nav.plans },
    { href: "#clients", label: t.nav.clients },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-gray/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo / Brand - Hidden on mobile */}
          <a href="#" className="hidden md:flex items-center flex-shrink-0 z-10">
            <Image
              src="/Antreva Tech Transparente.png"
              alt="Antreva Tech"
              width={220}
              height={55}
              sizes="(max-width: 1024px) 176px, 220px"
              quality={80}
              loading="lazy"
              className="h-14 lg:h-16 w-auto"
            />
          </a>
          {/* Home icon for mobile */}
          <a
            href="#"
            className="md:hidden p-2 text-midnight-navy hover:text-tech-blue transition-colors"
            aria-label="Home"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </a>

          {/* Desktop Navigation - centered on viewport */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 -translate-x-1/2"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-gray hover:text-tech-blue transition-colors font-medium text-sm lg:text-base"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Comenzar CTA - stays on the right */}
          <a
            href="#contact"
            className="hidden md:inline-flex bg-tech-blue text-white px-4 lg:px-5 py-2 rounded-lg hover:bg-tech-blue/90 transition-colors font-medium text-sm lg:text-base flex-shrink-0 z-10"
          >
            {t.nav.getStarted}
          </a>

          {/* Mobile Menu Button - Large touch target */}
          <button
            type="button"
            className="md:hidden p-2.5 -mr-2 text-midnight-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation - Full width with large touch targets */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-slate-gray/10">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-slate-gray hover:text-tech-blue active:text-tech-blue transition-colors font-medium py-3 px-2 -mx-2 rounded-lg active:bg-slate-gray/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                className="bg-tech-blue text-white px-5 py-3.5 rounded-lg hover:bg-tech-blue/90 active:bg-tech-blue/80 transition-colors font-medium text-center mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.getStarted}
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
