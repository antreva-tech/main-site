"use client";

import React, { useRef, useEffect, useState } from "react";

export type ScrollRevealVariant = "fadeUp" | "fade" | "slideLeft" | "slideRight" | "scale";

interface ScrollRevealProps {
  /** Animation style: fadeUp (default), fade, slideLeft, slideRight, scale */
  variant?: ScrollRevealVariant;
  /** When true, children animate in with staggered delay (use as grid/list wrapper) */
  stagger?: boolean;
  /** Root margin for IntersectionObserver (e.g. "0px 0px -60px 0px" to trigger earlier) */
  rootMargin?: string;
  /** Minimum fraction of element visible to reveal (0–1) */
  threshold?: number;
  children: React.ReactNode;
  className?: string;
  /** Optional element type (default div) */
  as?: "div" | "section" | "article" | "header";
}

const VARIANT_CLASS: Record<ScrollRevealVariant, string> = {
  fadeUp: "",
  fade: "scroll-reveal--fade",
  slideLeft: "scroll-reveal--slide-left",
  slideRight: "scroll-reveal--slide-right",
  scale: "scroll-reveal--scale",
};

/**
 * Wrapper that reveals content when it scrolls into view.
 * Uses Intersection Observer; respects prefers-reduced-motion (no animation).
 * Use stagger=true for grids/lists so children animate in sequence.
 */
export function ScrollReveal({
  variant = "fadeUp",
  stagger = false,
  rootMargin = "0px 0px -48px 0px",
  threshold = 0.1,
  children,
  className = "",
  as: Component = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const getMargin = () =>
      typeof window !== "undefined" && window.innerWidth < 768
        ? "0px 0px -24px 0px"
        : rootMargin;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { rootMargin: getMargin(), threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const baseClass = "scroll-reveal";
  const variantClass = VARIANT_CLASS[variant];
  const staggerClass = stagger ? "scroll-reveal--stagger" : "";
  const visibleClass = visible ? "is-visible" : "";

  return (
    <Component
      ref={ref as React.Ref<HTMLDivElement>}
      className={`${baseClass} ${variantClass} ${staggerClass} ${visibleClass} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}

export default ScrollReveal;
