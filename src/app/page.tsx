import { Header, Hero, CustomServices, ClientShowcase, Plans, Footer } from "@/components";
import { prisma } from "@/lib/prisma";

/**
 * Main landing page for Antreva Tech
 * Single-page layout with hero, services, client showcase, plans, and contact
 */
export default async function Home() {
  let showcaseClients: Array<{ id: string; name: string; company: string | null; websiteUrl: string | null; logoUrl: string | null; lineOfBusiness: string | null }>;
  try {
    showcaseClients = await prisma.client.findMany({
      where: { showOnWebsite: true, websiteUrl: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true, websiteUrl: true, logoUrl: true, lineOfBusiness: true },
    });
  } catch {
    // Prisma client may be stale (missing showOnWebsite or logoUrl). Fallback: any client with a URL, no logoUrl.
    const fallback = await prisma.client.findMany({
      where: { websiteUrl: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true, websiteUrl: true, lineOfBusiness: true },
    });
    showcaseClients = fallback.map((c) => ({ ...c, logoUrl: null }));
  }

  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <CustomServices />
        <ClientShowcase clients={showcaseClients} />
        <Plans />
      </main>
      <Footer />
    </>
  );
}
