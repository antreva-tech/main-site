import { Header, Hero, CustomServices, Plans, Footer } from "@/components";

/**
 * Main landing page for Antreva Tech
 * Single-page layout with hero, services, plans, and contact sections
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <CustomServices />
        <Plans />
      </main>
      <Footer />
    </>
  );
}
