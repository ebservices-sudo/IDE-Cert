import type { PriceUnit, Product } from "@/lib/catalog/types";

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export function formatPrice(value: number) {
  return eur.format(value);
}

export function unitSuffix(unit: PriceUnit) {
  switch (unit.kind) {
    case "metre":
      return "/ m";
    case "pair":
      return "/ pair";
    case "set":
      return "/ set";
    case "pack":
      return `/ pack of ${unit.size}`;
    default:
      return "";
  }
}

/** Lowest and highest variant price, ignoring per-metre cut lengths. */
export function priceRange(product: Product) {
  const fixed = product.variants.filter((v) => v.unit.kind !== "metre");
  const pool = fixed.length ? fixed : product.variants;
  const prices = pool.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices), unit: pool[0].unit };
}

export function formatPriceRange(product: Product) {
  const { min, max, unit } = priceRange(product);
  const suffix = unitSuffix(unit);
  const text = min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
  return suffix ? `${text} ${suffix}` : text;
}
