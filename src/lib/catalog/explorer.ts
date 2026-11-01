import { getSubcategory } from "@/config/catalog";
import { compareLengths, compareSizes } from "./options";
import { minPrice, standardOf } from "./listing";
import type { Product } from "./types";
import { productHref } from "./urls";
import { unitSuffix } from "@/lib/format";

// Compact product data for the shop explorer (/shop). Filtering, search and
// sorting run in the browser over this list, so it carries only what cards and
// filters need: no descriptions, no variants (the quick view fetches those).

export type ExplorerItem = {
  slug: string;
  href: string;
  name: string;
  /** Primary placement, "world/subcategory". */
  cat: string;
  /** Every placement including "also listed in". */
  cats: string[];
  catName: string;
  image: string | null;
  /** Lowest price in EUR incl. VAT (fixed-length variants first). */
  price: number;
  unit: string;
  colours: string[];
  sizes: string[];
  lengths: string[];
  use: string[];
  stds: string[];
  isNew: boolean;
  rank: number;
  chips: string[];
  variants: number;
  /** Item numbers, for search. */
  skus: string[];
};

const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))];

export function toExplorerItem(p: Product): ExplorerItem {
  const fixed = p.variants.filter((v) => v.unit.kind !== "metre");
  const pool = fixed.length ? fixed : p.variants;
  return {
    slug: p.slug,
    href: productHref(p),
    name: p.name,
    cat: `${p.mainCategory}/${p.subcategory}`,
    cats: uniq([`${p.mainCategory}/${p.subcategory}`, ...(p.alsoIn ?? []).map((a) => `${a.mainCategory}/${a.subcategory}`)]),
    catName: getSubcategory(p.mainCategory, p.subcategory)?.name ?? "",
    image: p.images[0]?.src ?? null,
    price: minPrice(p),
    unit: unitSuffix(pool[0].unit),
    colours: uniq(p.variants.map((v) => v.options.colour)),
    sizes: uniq(p.variants.map((v) => v.options.size)).sort(compareSizes),
    lengths: uniq(p.variants.map((v) => v.options.length)).sort(compareLengths),
    use: p.use,
    stds: uniq(p.certifications.map(standardOf)),
    isNew: Boolean(p.isNew),
    rank: p.rank,
    chips: (p.chips ?? []).slice(0, 2),
    variants: p.variants.length,
    skus: p.variants.map((v) => v.sku),
  };
}
