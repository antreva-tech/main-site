# Antreva Tech — Main Site

**Engineering Digital Intelligence**

Corporate landing site for Antreva Tech: software development, AI, cybersecurity, cloud solutions, and digital platforms.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **i18n:** English / Spanish (context-based)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command   | Description        |
| --------- | ------------------ |
| `npm run dev`   | Start dev server   |
| `npm run build` | Production build   |
| `npm run start` | Run production app |
| `npm run lint`  | Run ESLint         |

## Project Structure

```
src/
├── app/           # Next.js App Router (layout, page, globals)
├── components/    # Header, Hero, CustomServices, Plans, Footer
├── contexts/     # LanguageContext (en/es)
├── data/         # Plans and static content
└── i18n/         # en.json, es.json
```

## Brand

- **Colors:** Midnight Navy (#0B132B), Tech Blue (#1C6ED5), Slate Gray (#8A8F98), White (#FFFFFF)
- **Typography:** Inter / Sora (primary), Roboto (secondary)

## Low mobile data

- **Images:** Next.js Image with AVIF/WebP, responsive `sizes`, and `quality` 75–82. Only the hero logo uses `priority`; others lazy-load.
- **Config:** `next.config.ts` sets `deviceSizes` / `imageSizes` and 30-day image cache. No `unoptimized` images.

## SEO & AI Discoverability

- **Metadata:** Open Graph, Twitter cards, canonical URL, `metadataBase` for absolute URLs.
- **Structured data (JSON-LD):** Organization, LocalBusiness, FAQPage for Google and AI (ChatGPT, Claude).
- **Crawlers:** `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and `/robots.txt`.
- **Production:** Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://www.antrevatech.com`) so sitemap, robots, and OG URLs use your live domain.

## Deploy

[Vercel](https://vercel.com) is recommended for Next.js. Set `NEXT_PUBLIC_SITE_URL` in project env. See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).
