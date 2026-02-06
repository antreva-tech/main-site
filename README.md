# Antreva Tech — Main Site

**Engineering Digital Intelligence**

Corporate landing site and CRM dashboard for Antreva Tech: software development, AI, cybersecurity, cloud solutions, and digital platforms.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Neon Postgres with Prisma (driver adapter)
- **Auth:** Session-based login, RBAC, optional MFA (TOTP)
- **i18n:** English / Spanish (context-based)

## Getting Started

1. Copy `.env.example` to `.env.local` and set:
   - `DATABASE_URL` — Neon Postgres connection string ([Neon Console](https://console.neon.tech))
   - `ENCRYPTION_KEY` — 64-char hex (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `SESSION_SECRET` — 64-char hex for cookie signing
   - Optional: `WHATSAPP_*` for WhatsApp Business Cloud API; `SEED_*` for seed data; `BLOB_READ_WRITE_TOKEN` for Vercel Blob (client logos, uploads)
2. Run:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use seeded credentials to log in at `/login`.

## Scripts

| Command            | Description           |
| ------------------ | --------------------- |
| `npm run dev`      | Start dev server       |
| `npm run build`    | Prisma generate + build |
| `npm run start`    | Run production app    |
| `npm run lint`     | Run ESLint            |
| `npm run typecheck`| TypeScript check      |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed`  | Seed database         |
| `npm run db:studio`| Open Prisma Studio    |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # login, logout
│   ├── (dashboard)/      # dashboard (overview, pipeline, clients, credentials, demos,
│   │   dashboard/        #   development, payments, tickets, whatsapp, settings)
│   ├── api/webhooks/     # WhatsApp webhook
│   ├── layout.tsx, page.tsx, globals.css, robots.ts, sitemap.ts
├── components/           # Header, Hero, CustomServices, Plans, ClientShowcase, Footer, etc.
├── contexts/             # AuthContext, LanguageContext
├── data/                 # Plans and static content
├── i18n/                 # en.json, es.json
└── lib/                  # auth, prisma, encryption, audit, whatsapp, seo, pricing, etc.
prisma/
├── schema.prisma         # CRM schema (Users, Roles, Leads, Clients, Tickets, DemoSite, etc.)
└── seed.ts
```

## Dashboard (CRM)

- **Overview** — Recent leads and key metrics
- **Pipeline** — Lead stages, convert to client (drag-and-drop board)
- **Clients** — Contacts, credentials, subscriptions, single charges, tickets, development projects, logo upload
- **Credentials** — Stored credentials list
- **Demos** — Demo sites list and management
- **Development** — Project board and logs
- **Payments** — Payment list and actions
- **Tickets** — Support tickets and comments
- **WhatsApp** — Inbox and conversations (Cloud API)
- **Settings** — Audit log, bank accounts, profile, roles, users

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
