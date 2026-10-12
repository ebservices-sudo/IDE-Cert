# IDE Cert — website and shop

Website and online shop for **IDE Cert SH.P.K.** (Prishtinë, Kosovo): EDELRID climbing and work-at-height
equipment, plus IDE Cert's inspection, design, engineering and certification services.

Domain (planned): `ide-cert.com` on Cloudflare.

## Run it locally

Requires Node.js 20+ (built with Node 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Production build (also validates Cache Components rules) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run icons` | Regenerate favicon / app icons from `public/brand/app-icon*.svg` |

## Stack

- Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript
- Tailwind CSS 4: brand tokens live in `src/app/globals.css`
- Archivo variable font (width axis: normal for text, 125% for display headings)
- Planned: Cloudflare Workers via OpenNext, D1 database, R2 storage (from step 4)

> Next.js 16 differs from older versions. Read the docs bundled in `node_modules/next/dist/docs/` before changing
> routing, caching or data fetching (see `AGENTS.md`).

## Where things are

| Path | Contents |
| --- | --- |
| `src/config/site.ts` | Company name, phones, email, address, navigation |
| `src/config/catalog.ts` | The two shop worlds (Sport / Professional) and their subcategories |
| `src/lib/catalog/types.ts` | Product and variant data model |
| `src/components/brand/Logo.tsx` | Logo as React SVG (redrawn from `public/logo/ide-cert-logo-original.png`) |
| `public/brand/` | Logo and app-icon SVG masters |
| `src/app/` | Pages (routes) |
| `src/data/preview-products.ts` | Temporary sample products (replaced by the full catalogue in step 2) |

## Brand

| Token | Hex | Use |
| --- | --- | --- |
| `brand` | `#E5484D` | Logo red, accents, red on near-black |
| `brand-strong` | `#CE2C31` | Buttons with white text, red text on white (WCAG AA) |
| `ink` | `#141414` | Text, dark header / hero / footer |

## Build plan

1. ✅ Project setup, brand, logo, header/nav/footer, home page
2. Price-list import, shop listings, filters, sort, search
3. Product page
4. Cart, checkout (bank transfer + proforma), quote form, order emails
5. Admin panel
6. Services, About, Contact, legal pages
7. SEO, performance and accessibility pass, Cloudflare deployment, final README and TODO list
