import "server-only";
import { shop } from "@/config/site";
import { getSubcategory } from "@/config/catalog";
import { getCatalog } from "@/lib/catalog/data";
import { productHref } from "@/lib/catalog/urls";
import type { PriceUnit, VariantOptions } from "@/lib/catalog/types";

// Prices a cart on the server from the current catalogue. The browser only
// sends item numbers and quantities; it never decides a price.

export type PricedLine = {
  sku: string;
  slug: string;
  name: string;
  href: string;
  image: string | null;
  category: string;
  options: VariantOptions;
  optionsText: string;
  unit: PriceUnit;
  qty: number;
  maxQty: number;
  unitCents: number;
  lineCents: number;
};

export type PricedCart = {
  lines: PricedLine[];
  /** Item numbers that are no longer sold. */
  unavailable: string[];
  itemsCents: number;
  /** VAT contained in the item total. */
  vatCents: number;
};

export const toCents = (eur: number) => Math.round(eur * 100);

export function optionsText(o: VariantOptions) {
  return [o.config, o.colour, o.length, o.size].filter(Boolean).join(" · ");
}

export function unitLabel(unit: PriceUnit) {
  switch (unit.kind) {
    case "metre":
      return "m";
    case "pair":
      return "pair";
    case "set":
      return "set";
    case "pack":
      return `pack of ${unit.size}`;
    default:
      return "pc";
  }
}

export function vatIncluded(totalCents: number) {
  return totalCents - Math.round(totalCents / (1 + shop.vatRate));
}

export async function priceCart(input: { sku: string; qty: number }[]): Promise<PricedCart> {
  const { getVariant } = await getCatalog();
  const lines: PricedLine[] = [];
  const unavailable: string[] = [];
  const seen = new Set<string>();
  for (const { sku, qty: rawQty } of input.slice(0, 100)) {
    if (seen.has(sku)) continue;
    seen.add(sku);
    const found = getVariant(sku);
    if (!found) {
      unavailable.push(sku);
      continue;
    }
    const { product, variant } = found;
    const maxQty = variant.unit.kind === "metre" ? shop.maxCutLength : 99;
    const qty = Math.min(maxQty, Math.max(1, Math.round(Number(rawQty) || 1)));
    const unitCents = toCents(variant.price);
    const image = product.images.find((im) => im.colour === variant.options.colour) ?? product.images[0];
    lines.push({
      sku,
      slug: product.slug,
      name: product.name,
      href: `${productHref(product)}?sku=${sku}`,
      image: image?.src ?? null,
      category: getSubcategory(product.mainCategory, product.subcategory)?.name ?? "",
      options: variant.options,
      optionsText: optionsText(variant.options),
      unit: variant.unit,
      qty,
      maxQty,
      unitCents,
      lineCents: unitCents * qty,
    });
  }
  const itemsCents = lines.reduce((s, l) => s + l.lineCents, 0);
  return { lines, unavailable, itemsCents, vatCents: vatIncluded(itemsCents) };
}
