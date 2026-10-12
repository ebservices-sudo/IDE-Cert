# Launch TODO

What is still needed before ide-cert.com goes live. The shop works end to end today (catalogue, cart,
checkout, quotes, accounts, admin, price-list upload); these items are information and decisions only the
client can provide, plus the one-time Cloudflare setup.

Catalogue data gaps (products without official EDELRID data, missing photos/certifications) are listed
item by item in [data/TODO.md](data/TODO.md).

## 1. Information needed from IDE Cert

| Item | Where it goes | Effect until then |
| --- | --- | --- |
| Bank name, IBAN, SWIFT for proforma invoices | `src/config/business.ts` | Admin cannot send proformas (the button explains why) |
| Company NUI and VAT number | `src/config/business.ts` | Left off proformas and the terms page |
| Shipping rates for Kosovo, Western Balkans, EU (and free-shipping threshold, if any) | `src/config/shipping.ts` | Checkout says "shipping confirmed on your proforma"; admin enters it per order |
| Should the EU be served at launch? | `src/config/shipping.ts` (remove the zone) | EU countries can order |
| Typical delivery time after payment (e.g. "7–14 working days") | `src/config/site.ts → shop.leadTime` | Pages say the date is confirmed by email |
| Description of each service (scope, standards, accreditation if any) | `src/config/services.ts` | General wording, no claims |
| About text: history, team, photos | `src/app/(site)/about/page.tsx` | Company facts only |
| Prices for Smart Belay servicing (or keep "on request") | `src/config/services.ts` | "Price on request" |
| `info@ide-cert.com` once the domain is live | `src/config/site.ts`, `wrangler.jsonc → SHOP_NOTIFY_EMAIL` | Gmail address shown and used |
| Opening hours (optional) | Contact page | Not shown |

## 2. To review and confirm

- [ ] **Legal texts** — Terms of sale, Privacy notice, Shipping & returns are drafts written from the agreed
      set-up (bank transfer + proforma, order on demand, no returns of used PPE or custom-cut rope). Have them
      reviewed (ideally by a Kosovo lawyer), then set `legal.reviewed = true` in `src/config/site.ts`.
- [ ] **Smart Belay X margin** — in the Adventure list the RRP is about net + VAT (≈1 % margin, e.g. €647.50
      RRP vs €544.12 net). Check with EDELRID whether the Adventure list is meant for direct sales.
- [ ] **Radialis Pro Adjust** — colour/size text and item numbers are swapped in the Adventure list; the shop
      follows the item numbers (…1380 = oasis L-XL, …3290 = icemint XS-M). Confirm with EDELRID.
- [ ] **Rope Tooth knife** (734700000000) — price-list colour "219 night-oasis" is not in the item number.
- [ ] **EDELRID 2026 price lists are "temporary versions"** (Aug/Sep 2025). Upload the final lists in the
      admin under *Price lists* when EDELRID sends them (or the Excel versions you have).
- [ ] **114 products without official data** (67 whose edelrid.com page is currently offline, 47 with no page,
      mostly new for 2026) — see data/TODO.md. Decide: send product sheets, re-run `npm run edelrid:fetch` later,
      or hide them until EDELRID publishes the data.
- [ ] **VAT for deliveries outside Kosovo** — prices include 18% Kosovo VAT; the proforma is where exports
      are handled. Confirm the treatment with your accountant.
- [ ] **Card payments** — choose the bank (ProCredit, Raiffeisen or TEB e-commerce), then implement
      `CardGateway` in `src/lib/payments/index.ts`. EDELRID's dealer terms ask for an instant payment method
      for online sales.

## 3. Cloudflare setup (one time) — see README → "Deploy to Cloudflare"

- [ ] Register `ide-cert.com` on Cloudflare; Workers **Paid** plan
- [ ] Create the D1 database and R2 bucket; put the D1 id in `wrangler.jsonc`; `npm run db:migrate:remote`
- [ ] Resend account, verify `ide-cert.com`, `wrangler secret put RESEND_API_KEY`; set `MAIL_FROM`
- [ ] Turnstile site for `ide-cert.com`: secret via `wrangler secret put`, site key as build variable
- [ ] Workers Builds connected to the repo; custom domains `ide-cert.com` and `www.ide-cert.com`
- [ ] `npm run admin:create -- <owner email> "Shpetim Lajqi" --remote`
- [ ] Email Routing: `info@ide-cert.com` → the inbox the client reads
- [ ] Place a real test order and quote on production, send a proforma to yourself, cancel the test order

## 4. Optional, later

- Albanian version (all texts are in `src/config/*` and page files; no translation layer yet)
- Remove `scripts/patch-opennext.mjs` and re-evaluate Cache Components once OpenNext supports Next 16.4 PPR
- Move product photos (53 MB in `public/products`) to R2 if the repository gets too heavy
- Analytics (none installed; the privacy notice says so — update it if you add any)
