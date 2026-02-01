/**
 * JSON-LD structured data for SEO and AI discoverability (ChatGPT, Claude, Google).
 * Schema.org types: Organization, LocalBusiness, FAQPage.
 */

import { SITE_URL, SITE_NAME } from "./seo";

/** Organization schema — defines the business entity for search and AI */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/Antreva%20Tech%20Transparente.png`,
    description:
      "Antreva Tech is a technology company focused on software development, artificial intelligence, cybersecurity, cloud solutions, and digital platforms. Tagline: Engineering Digital Intelligence.",
    slogan: "Engineering Digital Intelligence",
    foundingDate: "2024",
    sameAs: [] as string[],
  };
}

/** LocalBusiness schema — location and service area for local SEO */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Technology company offering software development, AI solutions, cybersecurity, cloud solutions, and digital plans (Start, Pro, Premium) in San Pedro de Macorís, Dominican Republic.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "San Pedro de Macorís",
      addressCountry: "DO",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: 18.46, longitude: -69.31 },
      geoRadius: "50000",
    },
    priceRange: "$$",
    openingHoursSpecification: { "@type": "OpeningHoursSpecification", opens: "09:00", closes: "18:00", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
  };
}

/** FAQ schema — Q&A format improves AI citation and rich results */
export function getFAQSchema(locale: "es" | "en" = "es") {
  const faqs =
    locale === "es"
      ? [
          {
            question: "¿Qué es Antreva Tech?",
            answer:
              "Antreva Tech es una empresa de tecnología enfocada en desarrollo de software, inteligencia artificial, ciberseguridad, soluciones en la nube y plataformas digitales. Su lema es 'Ingeniería de Inteligencia Digital'.",
          },
          {
            question: "¿Dónde está Antreva Tech?",
            answer:
              "Antreva Tech está ubicada en San Pedro de Macorís, República Dominicana, y ofrece servicios en la región y de forma remota.",
          },
          {
            question: "¿Qué servicios ofrece Antreva Tech?",
            answer:
              "Antreva Tech ofrece desarrollo de software a medida, soluciones de IA, ciberseguridad, soluciones en la nube y planes digitales Start, Pro y Premium (menús digitales, WhatsApp Business, sitios web, contenido y campañas).",
          },
          {
            question: "¿Cómo contactar a Antreva Tech?",
            answer:
              "Puedes contactar a Antreva Tech por WhatsApp al +1 809 355 7925 o mediante el formulario de contacto en su sitio web.",
          },
        ]
      : [
          {
            question: "What is Antreva Tech?",
            answer:
              "Antreva Tech is a technology company focused on software development, artificial intelligence, cybersecurity, cloud solutions, and digital platforms. Its tagline is 'Engineering Digital Intelligence'.",
          },
          {
            question: "Where is Antreva Tech located?",
            answer:
              "Antreva Tech is based in San Pedro de Macorís, Dominican Republic, and serves the region and remote clients.",
          },
          {
            question: "What services does Antreva Tech offer?",
            answer:
              "Antreva Tech offers custom software development, AI solutions, cybersecurity, cloud solutions, and digital plans Start, Pro and Premium (digital menus, WhatsApp Business, websites, content, and campaigns).",
          },
          {
            question: "How to contact Antreva Tech?",
            answer:
              "You can contact Antreva Tech via WhatsApp at +1 809 355 7925 or through the contact form on their website.",
          },
        ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
