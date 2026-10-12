import type { NextConfig } from "next";
import catalog from "./data/catalog/products.json";

type Placement = { mainCategory: string; subcategory: string };
type CatalogProduct = Placement & { slug: string; alsoIn?: Placement[] };

// A product listed in several categories has one canonical URL; the others redirect to it.
const productRedirects = (catalog.products as CatalogProduct[]).flatMap((p) =>
  (p.alsoIn ?? []).map((a) => ({
    source: `/shop/${a.mainCategory}/${a.subcategory}/${p.slug}`,
    destination: `/shop/${p.mainCategory}/${p.subcategory}/${p.slug}`,
    permanent: true,
  })),
);

const nextConfig: NextConfig = {
  // Cache Components / partial prerendering are deliberately off: with
  // @opennextjs/cloudflare 1.20.10 + Next 16.4, request-time parts of PPR pages
  // are not streamed on Workers (see README → "Why not Cache Components").
  // Pages are static (catalogue) or dynamic (account, admin) instead.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return productRedirects;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
      {
        // Product photos never change under the same name (named by EDELRID image id).
        source: "/products/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;

// `next dev`: expose the Cloudflare bindings from wrangler.jsonc (local D1, R2, …)
// to getCloudflareContext(), backed by .wrangler/state.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev());
}
