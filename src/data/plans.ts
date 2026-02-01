/**
 * Plan data structure: Start, Pro, Premium.
 */

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  tier: "START" | "PRO" | "PREMIUM";
  price: string;
  priceNote?: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

/**
 * Plans: Start, Pro, Premium.
 */
export const plans: Plan[] = [
  {
    id: "start",
    name: "Start",
    tier: "START",
    price: "RD$4,500",
    priceNote: "per month",
    description:
      "Perfect for businesses starting their digital journey with essential tools.",
    features: [
      { text: "WhatsApp Business setup", included: true },
      { text: "Digital menu with QR code", included: true },
      { text: "Basic website with WhatsApp button", included: true },
      { text: "Instagram profile optimization", included: true },
      { text: "Monthly support included", included: true },
      { text: "Advanced WhatsApp flows", included: false },
      { text: "Content creation", included: false },
      { text: "Digital campaigns", included: false },
    ],
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    tier: "PRO",
    price: "RD$7,500",
    priceNote: "per month",
    description:
      "For growing businesses ready to automate and create engaging content.",
    features: [
      { text: "Everything in START", included: true },
      { text: "Advanced WhatsApp automation", included: true },
      { text: "Monthly Instagram content pack", included: true },
      { text: "Website with order form", included: true },
      { text: "Basic cybersecurity checklist", included: true },
      { text: "Digital campaigns", included: false },
      { text: "Multi-page website", included: false },
      { text: "Security monitoring", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tier: "PREMIUM",
    price: "RD$12,000+",
    priceNote: "per month",
    description:
      "Full-service solution with advanced automation, campaigns, and security.",
    features: [
      { text: "Everything in PRO", included: true },
      { text: "Semi-automated WhatsApp", included: true },
      { text: "Digital campaign setup & reporting", included: true },
      { text: "Multi-page website", included: true },
      { text: "Reinforced cybersecurity", included: true },
      { text: "Security monitoring", included: true },
      { text: "Priority support", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
];

/**
 * Add-on services available for all plans
 */
export const addOns = [
  "Professional photography",
  "Paid ads management",
  "Extra content packs",
  "Additional pages / e-commerce",
  "Extended cybersecurity services",
];
