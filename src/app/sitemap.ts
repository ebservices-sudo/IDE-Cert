import type { MetadataRoute } from "next";
import { subcategoryHref, worldHref, worlds } from "@/config/catalog";
import { site } from "@/config/site";
import { baseProducts, catalogGeneratedAt, categoryCounts } from "@/lib/catalog/data";
import { productHref } from "@/lib/catalog/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;
  const catalogDate = new Date(catalogGeneratedAt);
  const pages = ["/", "/shop", "/services", "/about", "/contact", "/quote", "/shipping-returns", "/terms", "/privacy"].map((p) => ({
    url: url(p),
    changeFrequency: "monthly" as const,
    priority: p === "/" ? 1 : p === "/shop" ? 0.9 : 0.5,
  }));
  const categories = worlds.flatMap((w) => [
    { url: url(worldHref(w.slug)), lastModified: catalogDate, priority: 0.8 },
    ...w.subcategories
      .filter((s) => (categoryCounts[`${w.slug}/${s.slug}`] ?? 0) > 0)
      .map((s) => ({ url: url(subcategoryHref(w.slug, s.slug)), lastModified: catalogDate, priority: 0.7 })),
  ]);
  const products = baseProducts.map((p) => ({
    url: url(productHref(p)),
    lastModified: catalogDate,
    priority: 0.6,
    images: p.images.slice(0, 1).map((i) => url(i.src)),
  }));
  return [...pages, ...categories, ...products];
}
