# IDE Cert — website and shop

Website and online shop for **IDE Cert SH.P.K.** (Prishtinë, Kosovo): the EDELRID range for sport and
professional use, plus IDE Cert's inspection, design, engineering and certification services.
Runs on Cloudflare Workers (OpenNext) with D1 for orders, quotes, accounts and price lists.

Open items before launch are in **[TODO.md](TODO.md)**; catalogue data gaps in **[data/TODO.md](data/TODO.md)**.

## Run it locally

Node.js 20+ (developed with Node 24). Windows, macOS and Linux all work.

```bash
npm install
cp .dev.vars.example .dev.vars        # local secrets (Turnstile test key; Resend optional)
npm run db:migrate:local              # creates the local D1 database in .wrangler/
npm run admin:create -- you@example.com "Your Name"   # prints a password
npm run dev                           # http://localhost:3000
```

`npm run dev` gives the app the Cloudflare bindings from `wrangler.jsonc` (local D1 etc.). Without
`RESEND_API_KEY`, emails are printed to the terminal instead of sent.

To test the real Workers build locally: `npm run preview` (http://localhost:8787).

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server, production build, Node server (no database under `start`) |
| `npm run preview` / `deploy` | Build for Cloudflare and run locally in workerd / deploy |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run db:migrate:local` / `:remote` | Apply `migrations/*.sql` to local / production D1 |
| `npm run admin:create -- email "Name" [--remote]` | Create an admin account (or promote one) |
| `npm run catalog` | Rebuild the catalogue from the price lists + EDELRID data (see below) |
| `npm run edelrid:fetch` | Download and parse official EDELRID product pages |
| `npm run catalog:images` | Download product photos into `public/products/` |
| `npm run pricelist:extract -- in.pdf out.csv` | Turn an EDELRID price-list PDF into CSV |
| `npm run icons` | Regenerate favicon / app icons |

## Stack

- Next.js 16.4 (App Router), React 19, TypeScript, Tailwind CSS 4
- Cloudflare Workers via `@opennextjs/cloudflare` 1.20; D1 (data + cache tags), R2 (page cache), Images
- Resend for email, Cloudflare Turnstile for spam protection
- No payment provider yet: bank transfer against a proforma invoice; a card-gateway interface is ready
  in `src/lib/payments/` for whichever Kosovo bank is chosen (Stripe and PayPal do not serve Kosovo)

> Next.js 16 differs from older versions. Read the docs in `node_modules/next/dist/docs/` before changing
> routing or caching (see `AGENTS.md`).

### Why not Cache Components

`cacheComponents` / partial prerendering is **off on purpose**. With OpenNext 1.20.10 and Next 16.4, the
request-time parts of PPR pages are not streamed on Workers (React error #419, empty HTML holes, broken
redirects). The site therefore uses the classic model, which OpenNext supports well:

- Catalogue pages (home, categories, 635 product pages) are static. Filters, sort, search and "show more"
  run in the browser against `/api/listing`, so the unfiltered listing is in the HTML for search engines.
- Account and admin pages render per request (they read the session cookie).
- Prices go through `unstable_cache` tagged `prices`; publishing a price list calls
  `revalidateTag("prices")`, and the D1 tag cache makes every static page pick up the new prices.

`scripts/patch-opennext.mjs` (run by `cf:build`) adds `preview-props.json` to the manifests OpenNext
inlines, which Next 16.4 needs. Remove it when OpenNext ships the fix.

## Deploy to Cloudflare

Needs the **Workers Paid** plan ($5/month): password hashing (PBKDF2, 100 000 rounds) needs more CPU time
per request than the free plan's 10 ms, and the Worker is ~2.2 MB gzipped (free limit 3 MB).

One-time setup (`npx wrangler login` first):

```bash
npx wrangler d1 create ide-cert-db                 # paste the id into both D1 entries in wrangler.jsonc
npx wrangler r2 bucket create ide-cert-opennext-cache
npm run db:migrate:remote
npx wrangler secret put RESEND_API_KEY             # https://resend.com — verify the ide-cert.com domain
npx wrangler secret put TURNSTILE_SECRET_KEY       # Cloudflare dashboard → Turnstile → add site
npm run admin:create -- owner@ide-cert.com "Shpetim Lajqi" --remote
```

Then either `npm run deploy` from a machine with `NEXT_PUBLIC_TURNSTILE_SITE_KEY` set, or (recommended)
connect the GitHub repo in **Workers & Pages → Create → Import a repository** (Workers Builds):

- Build command: `npm run cf:build` · Deploy command: `npx opennextjs-cloudflare deploy`
- Build variable: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the Turnstile site key
- Add the custom domain `ide-cert.com` (and `www`) under the Worker's **Domains & Routes**.

Settings in `wrangler.jsonc → vars`: `SHOP_NOTIFY_EMAIL` (where order/quote notifications go) and
`MAIL_FROM` (sender, must be on the Resend-verified domain). Email Routing can forward `info@ide-cert.com`.

Turnstile is optional: without both the site key (build) and the secret (runtime), forms skip the check.

## Product data

Safety equipment: **no technical value is invented.** Specs, certifications, descriptions, downloads and
photos come only from edelrid.com; prices, item numbers, colours and sizes only from the EDELRID 2026 price
lists. Gaps are listed in `data/TODO.md` and shown on the product page.

```
EDELRID price-list PDFs ──pricelist:extract──▶ data/pricelists/2026/*.csv ─┐
edelrid.com product pages ──edelrid:fetch───▶ data/edelrid/pages.json ─────┼─ catalog ─▶ data/catalog/products.json
                                                                           │            data/catalog/net-prices.json (admin only)
scripts/catalog/rules.mjs (categories, names, label fixes) ────────────────┘            data/catalog/images.json ─ catalog:images ─▶ public/products/
```

- **New EDELRID price list (prices only):** upload it in the admin under *Price lists*. No deploy needed.
- **New products / new season:** extract the PDFs to `data/pricelists/2026/` (or a new year folder and
  update `LISTS` in `scripts/build-catalog.mjs`), run `edelrid:fetch`, `catalog`, `catalog:images`, commit.
- **Category placement / names:** `scripts/catalog/rules.mjs`, then `npm run catalog`.
- Net dealer prices are kept in `data/catalog/net-prices.json` and only read by admin pages on the server.

## Where things are

| Path | Contents |
| --- | --- |
| `src/config/` | Site facts, catalogue worlds/categories, shipping zones, business & bank details, services, Turnstile |
| `src/app/(site)/` | Public pages; `src/app/admin/` admin panel; `src/app/api/` cart, listing and search endpoints |
| `src/actions/` | Server actions: checkout, quote, contact, account, admin |
| `src/lib/catalog/` | Catalogue access (with price overrides), listing/filter logic, cards, FAQs |
| `src/lib/orders/` | Cart pricing, orders/quotes in D1 |
| `src/lib/auth/` | Password hashing and cookie sessions |
| `src/lib/server/` | Env/D1 access, email (Resend), email templates, Turnstile |
| `migrations/` | D1 schema |
| `scripts/` | Data pipeline, admin creation, OpenNext patch, icons |

All user-facing text is English and lives in components/config (no translation layer yet); strings for a
future Albanian version are concentrated in `src/config/*` and the page files.

## Brand

| Token | Hex | Use |
| --- | --- | --- |
| `brand` | `#E5484D` | Logo red, accents, red on near-black |
| `brand-strong` | `#CE2C31` | Buttons with white text, red text on white (WCAG AA) |
| `ink` | `#141414` | Text, dark header / hero / footer |
