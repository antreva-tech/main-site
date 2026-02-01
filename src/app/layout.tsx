import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Sora, Roboto } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SITE_URL, SITE_NAME, DEFAULT_LOCALE, OG_IMAGE_URL } from "@/lib/seo";
import {
  getOrganizationSchema,
  getLocalBusinessSchema,
  getFAQSchema,
} from "@/lib/structuredData";
import "./globals.css";

/**
 * Primary font - Inter for body text and general UI
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Primary font - Sora for headings and emphasis
 */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Secondary font - Roboto for secondary text elements
 */
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const defaultTitle = `${SITE_NAME} — Ingeniería de Inteligencia Digital`;
const defaultDescription =
  "Antreva Tech es una empresa de tecnología enfocada en desarrollo de software, inteligencia artificial, ciberseguridad, soluciones en la nube y plataformas digitales. San Pedro de Macorís, República Dominicana.";
const defaultKeywords = [
  "desarrollo de software",
  "inteligencia artificial",
  "IA",
  "ciberseguridad",
  "soluciones en la nube",
  "plataformas digitales",
  "planes Start Pro Premium",
  "San Pedro de Macorís",
  "República Dominicana",
  "Antreva Tech",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: defaultTitle, template: `%s | ${SITE_NAME}` },
  description: defaultDescription,
  keywords: defaultKeywords,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "es_DO",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Engineering Digital Intelligence`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [OG_IMAGE_URL],
  },
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {},
};

const LOCALE_COOKIE = "locale";

/**
 * Root layout component that wraps all pages
 * Applies brand fonts, base styling, and language provider.
 * Reads locale cookie so language is consistent across marketing and dashboard.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = localeCookie === "en" || localeCookie === "es" ? localeCookie : "en";

  const orgSchema = getOrganizationSchema();
  const localSchema = getLocalBusinessSchema();
  const faqSchema = getFAQSchema(locale as "es" | "en");

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${sora.variable} ${roboto.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-tech-blue focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
        <LanguageProvider defaultLocale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
