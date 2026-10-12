import type { WorldSlug } from "@/config/catalog";

/** How a price is counted: per piece, per pair, per pack of N, or per metre of rope. */
export type PriceUnit =
  | { kind: "piece" }
  | { kind: "pair" }
  | { kind: "set" }
  | { kind: "pack"; size: number }
  | { kind: "metre" };

export type VariantOptions = {
  colour?: string;
  length?: string;
  size?: string;
  /** Pre-assembled configuration or pack size, e.g. "Smart Belay X, Pilot Bar, Cupid" or "Pack of 10". */
  config?: string;
};

export type Variant = {
  /** EDELRID item number. */
  sku: string;
  options: VariantOptions;
  /** EDELRID recommended retail price in EUR, incl. VAT. */
  price: number;
  compareAtPrice?: number;
  unit: PriceUnit;
  /** null = ordered on demand from EDELRID (no local stock). */
  stock: number | null;
  /** Printed in bold (new for 2026) in the EDELRID price list. */
  isNew?: boolean;
  gtin?: string;
};

export type Download = { label: string; url: string; kind: "manual" | "doc" | "datasheet" | "other" };

export type Faq = { question: string; answer: string };

export type ProductImage = { src: string; alt: string; colour?: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  mainCategory: WorldSlug;
  subcategory: string;
  /** Also listed here (same product, one canonical URL). */
  alsoIn?: { mainCategory: WorldSlug; subcategory: string }[];
  shortDescription: string;
  description: string;
  features: string[];
  /** Official manufacturer data only. Missing values are left out and tracked in data/TODO.md. */
  specs: Record<string, string>;
  /** Properties EDELRID lists without a value, e.g. "UV protection", "Middle marking". */
  properties: string[];
  certifications: string[];
  technologies: string[];
  badges: string[];
  use: string[];
  variants: Variant[];
  images: ProductImage[];
  downloads: Download[];
  faqs: Faq[];
  related: string[];
  tags: string[];
  isNew?: boolean;
  /** Short spec chips for cards, e.g. ["10.5 mm", "EN 1891 Type A"]. */
  chips?: string[];
  /** Position in EDELRID's price lists; used for the default "Popular" sort. */
  rank: number;
  /** Official EDELRID product page the data comes from; null when none exists yet. */
  source: { url: string; name: string } | null;
  priceLists: string[];
  /** Things only available on request (batches, custom lengths, terminations). */
  quoteNotes?: string[];
};
