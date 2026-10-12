import { getSubcategory, worlds } from "@/config/catalog";
import { compareLengths, compareSizes } from "./options";
import type { Product } from "./types";

// Filtering, facet counts, sorting and search for product listings.
// Facets are generated from the data in scope; values within a facet are
// OR-ed, facets are AND-ed, and each facet's counts ignore its own selection.

export type SortKey = "relevance" | "popular" | "new" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Best match" },
  { key: "popular", label: "Popular" },
  { key: "new", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name-asc", label: "Name: A–Z" },
  { key: "name-desc", label: "Name: Z–A" },
];

export type FacetValue = { value: string; label: string; count: number; selected: boolean };
export type Facet = { key: string; label: string; kind: "multi" | "toggle"; values: FacetValue[] };

export type ListingState = {
  q: string;
  sort: SortKey;
  filters: Record<string, string[]>;
  /** Pages of results shown ("Show more"). */
  page: number;
};

export const PAGE_SIZE = 36;

export type Listing = {
  results: Product[];
  total: number;
  facets: Facet[];
  state: ListingState;
};

type FacetDef = {
  key: string;
  label: string;
  kind?: "multi" | "toggle";
  values: (p: Product) => string[];
  label_?: (v: string) => string;
  compare?: (a: string, b: string) => number;
};

// --- value extraction ------------------------------------------------------

const fixedVariants = (p: Product) => {
  const fixed = p.variants.filter((v) => v.unit.kind !== "metre");
  return fixed.length ? fixed : p.variants;
};

export const minPrice = (p: Product) => Math.min(...fixedVariants(p).map((v) => v.price));

const PRICE_BUCKETS: [string, string, number, number][] = [
  ["0-25", "Under €25", 0, 25],
  ["25-50", "€25 – €50", 25, 50],
  ["50-100", "€50 – €100", 50, 100],
  ["100-250", "€100 – €250", 100, 250],
  ["250-500", "€250 – €500", 250, 500],
  ["500+", "€500 and over", 500, Infinity],
];

const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))];

/** "EN 1891 Type A" → "EN 1891"; "UIAA 105" stays; "+ Fuse = EN 12841-A" and "NO PPE" are skipped. */
export function standardOf(cert: string): string | undefined {
  const m = cert.match(/^(EN ISO \d+(?:-\d+)?|EN \d+(?:-\d+)?|UIAA \d+|ANSI(?:\/ASSE| \/ ASS[EP])? Z[\d.]+|ASTM F\d+|CEN\/TS \d+)/);
  return m?.[1].replace(/ANSI ?\/ ?ASS[EP]/, "ANSI");
}

const diameterOf = (p: Product) => {
  const d = p.specs.Diameter?.match(/^(\d+(?:\.\d+)?) mm$/);
  return d && Number(d[1]) < 20 ? `${Number(d[1])} mm` : undefined;
};

const ropeTypes = (p: Product) =>
  uniq([
    p.specs["Rope type"],
    p.properties.includes("Single Rope") ? "Single rope" : undefined,
    p.properties.includes("Double rope") ? "Double (half) rope" : undefined,
    p.properties.includes("Twin Rope") ? "Twin rope" : undefined,
  ]);

const naturalNumber = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isNaN(n) ? Infinity : n;
};

function facetDefs(opts: { categories: boolean }): FacetDef[] {
  const defs: FacetDef[] = [];
  if (opts.categories) {
    defs.push({
      key: "world",
      label: "Range",
      values: (p) => uniq([p.mainCategory, ...(p.alsoIn ?? []).map((a) => a.mainCategory)]),
      label_: (v) => worlds.find((w) => w.slug === v)?.name ?? v,
    });
    defs.push({
      key: "category",
      label: "Category",
      values: (p) => uniq([`${p.mainCategory}/${p.subcategory}`, ...(p.alsoIn ?? []).map((a) => `${a.mainCategory}/${a.subcategory}`)]),
      label_: (v) => {
        const [w, s] = v.split("/");
        const sub = getSubcategory(w, s);
        return sub ? `${sub.name} (${worlds.find((x) => x.slug === w)?.name})` : v;
      },
    });
  }
  defs.push(
    { key: "new", label: "New for 2026", kind: "toggle", values: (p) => (p.isNew ? ["yes"] : []) },
    {
      key: "price",
      label: "Price",
      values: (p) => {
        const prices = fixedVariants(p).map((v) => v.price);
        return PRICE_BUCKETS.filter(([, , lo, hi]) => prices.some((x) => x >= lo && x < hi)).map(([k]) => k);
      },
      label_: (v) => PRICE_BUCKETS.find(([k]) => k === v)?.[1] ?? v,
      compare: (a, b) => PRICE_BUCKETS.findIndex(([k]) => k === a) - PRICE_BUCKETS.findIndex(([k]) => k === b),
    },
    { key: "use", label: "Use", values: (p) => p.use },
    { key: "diameter", label: "Diameter", values: (p) => uniq([diameterOf(p)]), compare: (a, b) => naturalNumber(a) - naturalNumber(b) },
    { key: "rope-type", label: "Rope type", values: ropeTypes },
    { key: "shape", label: "Carabiner shape", values: (p) => uniq([p.specs["Carabiner shape"]]) },
    { key: "closure", label: "Gate / closure", values: (p) => uniq([p.specs.Closure]) },
    { key: "length", label: "Length", values: (p) => uniq(p.variants.map((v) => v.options.length)), compare: compareLengths },
    { key: "size", label: "Size", values: (p) => uniq(p.variants.map((v) => v.options.size)), compare: compareSizes },
    { key: "colour", label: "Colour", values: (p) => uniq(p.variants.map((v) => v.options.colour)) },
    { key: "cert", label: "Standard", values: (p) => uniq(p.certifications.map(standardOf)) },
  );
  return defs;
}

// --- search ----------------------------------------------------------------

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9.*]+/g, " ").trim();

function searchScore(p: Product, terms: string[]): number {
  if (!terms.length) return 1;
  const name = fold(p.name);
  const sub = getSubcategory(p.mainCategory, p.subcategory)?.name ?? "";
  const hay = fold(
    [
      p.name,
      sub,
      ...(p.alsoIn ?? []).map((a) => getSubcategory(a.mainCategory, a.subcategory)?.name ?? ""),
      p.shortDescription,
      ...p.certifications,
      ...p.tags,
      ...(p.chips ?? []),
      ...p.variants.map((v) => `${v.sku} ${v.options.colour ?? ""}`),
    ].join(" "),
  );
  let score = 0;
  for (const t of terms) {
    if (name.split(" ").includes(t)) score += 10;
    else if (name.includes(t)) score += 6;
    else if (hay.includes(t)) score += 2;
    else return 0;
  }
  if (name.startsWith(terms.join(" "))) score += 5;
  return score;
}

/** Query string for a listing state (default sort and page 1 are omitted). */
export function toSearch(state: ListingState, defaultSort: SortKey) {
  const sp = new URLSearchParams();
  if (state.q) sp.set("q", state.q);
  for (const [k, values] of Object.entries(state.filters)) for (const v of values) sp.append(k, v);
  if (state.sort !== defaultSort) sp.set("sort", state.sort);
  if (state.page > 1) sp.set("page", String(state.page));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// --- main ------------------------------------------------------------------

type Params = Record<string, string | string[] | undefined>;

export function parseListingState(params: Params, defaultSort: SortKey): ListingState {
  const filters: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k === "q" || k === "sort" || k === "page" || k === "scope" || v == null) continue;
    const values = (Array.isArray(v) ? v : [v]).filter(Boolean).slice(0, 30);
    if (values.length) filters[k] = values;
  }
  const sortParam = typeof params.sort === "string" ? params.sort : "";
  const sort = (sortOptions.some((s) => s.key === sortParam) ? sortParam : defaultSort) as SortKey;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const page = Math.min(50, Math.max(1, Number.parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1));
  return { q, sort, filters, page };
}

export function buildListing(scope: Product[], state: ListingState, opts: { categories?: boolean } = {}): Listing {
  const terms = fold(state.q).split(" ").filter(Boolean);
  const scores = new Map<Product, number>();
  const searched = terms.length
    ? scope.filter((p) => {
        const s = searchScore(p, terms);
        if (s) scores.set(p, s);
        return s > 0;
      })
    : scope;

  const defs = facetDefs({ categories: Boolean(opts.categories) });
  const active = defs.filter((d) => state.filters[d.key]?.length);
  const matches = (p: Product, d: FacetDef) => {
    const want = state.filters[d.key];
    const have = d.values(p);
    return want.some((w) => have.includes(w));
  };

  const results = searched.filter((p) => active.every((d) => matches(p, d)));

  const facets: Facet[] = [];
  for (const d of defs) {
    // Counts for this facet ignore its own selection.
    const base = searched.filter((p) => active.every((a) => a === d || matches(p, a)));
    const counts = new Map<string, number>();
    for (const p of base) for (const v of d.values(p)) counts.set(v, (counts.get(v) ?? 0) + 1);
    const inScope = new Set(searched.flatMap((p) => d.values(p)));
    const selected = state.filters[d.key] ?? [];
    // Hide facets that cannot narrow anything down.
    if (d.kind !== "toggle" && inScope.size < 2 && !selected.length) continue;
    if (d.kind === "toggle" && (!inScope.size || inScope.size === searched.length) && !selected.length) continue;
    const values = [...new Set([...inScope, ...selected])]
      .map((v) => ({ value: v, label: d.label_ ? d.label_(v) : v, count: counts.get(v) ?? 0, selected: selected.includes(v) }))
      .sort(d.compare ? (a, b) => d.compare!(a.value, b.value) : (a, b) => b.count - a.count || a.label.localeCompare(b.label));
    if (d.kind === "toggle" && !values.length) continue;
    facets.push({ key: d.key, label: d.label, kind: d.kind ?? "multi", values });
  }

  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, "en", { numeric: true });
  const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    relevance: (a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0) || a.rank - b.rank,
    popular: (a, b) => a.rank - b.rank,
    new: (a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || a.rank - b.rank,
    "price-asc": (a, b) => minPrice(a) - minPrice(b) || byName(a, b),
    "price-desc": (a, b) => minPrice(b) - minPrice(a) || byName(a, b),
    "name-asc": byName,
    "name-desc": (a, b) => byName(b, a),
  };
  const sort = state.sort === "relevance" && !terms.length ? "popular" : state.sort;
  results.sort(sorters[sort]);

  return { results, total: results.length, facets, state: { ...state, sort } };
}
