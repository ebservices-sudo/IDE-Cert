import type { Product } from "./types";

export function productHref(p: Pick<Product, "mainCategory" | "subcategory" | "slug">) {
  return `/shop/${p.mainCategory}/${p.subcategory}/${p.slug}`;
}
