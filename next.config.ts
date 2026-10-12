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
  cacheComponents: true,
  partialPrefetching: true,
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
};

export default nextConfig;

// `next dev`: expose the Cloudflare bindings from wrangler.jsonc (local D1, R2, …)
// to getCloudflareContext(), backed by .wrangler/state.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev());
}
