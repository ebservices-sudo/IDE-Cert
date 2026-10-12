import type { Variant, VariantOptions } from "./types";

// Ordering of variant option values, shared by filters and the product page.

export const SIZE_ORDER = ["XXS", "XS", "XS/S", "XS-M", "S", "S-M", "M", "M/L", "L", "L-XL", "XL", "XXL", "Vario"];

const num = (s: string) => {
  const n = Number.parseFloat(s.replace(",", "."));
  return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n;
};

export function compareSizes(a: string, b: string) {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  return num(a) - num(b) || a.localeCompare(b);
}

export function compareLengths(a: string, b: string) {
  if (a === "Cut to length") return 1;
  if (b === "Cut to length") return -1;
  const scale = (s: string) => (/ cm$/.test(s) ? 0.01 : 1);
  return num(a) * scale(a) - num(b) * scale(b);
}

export type OptionDim = keyof VariantOptions;
export const OPTION_DIMS: OptionDim[] = ["config", "colour", "length", "size"];
export const OPTION_LABELS: Record<OptionDim, string> = {
  config: "Version",
  colour: "Colour",
  length: "Length",
  size: "Size",
};

/** Distinct values per option, in display order. Options with a single value are kept (shown as plain text). */
export function optionValues(variants: Variant[]) {
  const out: { dim: OptionDim; values: string[] }[] = [];
  for (const dim of OPTION_DIMS) {
    const values = [...new Set(variants.map((v) => v.options[dim]).filter((x): x is string => Boolean(x)))];
    if (!values.length) continue;
    if (dim === "size") values.sort(compareSizes);
    if (dim === "length") values.sort(compareLengths);
    out.push({ dim, values });
  }
  return out;
}
