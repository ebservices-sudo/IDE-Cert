"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronDown, Info, Search, SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import { getSubcategory, worlds, type WorldSlug } from "@/config/catalog";
import { categoryGuide, filterHelp, uses } from "@/config/shopGuide";
import type { ExplorerItem } from "@/lib/catalog/explorer";
import { compareLengths, compareSizes } from "@/lib/catalog/options";
import { formatPrice } from "@/lib/format";
import { ShopIcon } from "./ShopIcon";
import { QuickView } from "./QuickView";
import { colourFill } from "./colours";

// The shop: search, "what is it for?", categories with plain-language help and
// friendly refine filters, all filtering in the browser over the whole catalogue.
// Cards open a quick view where visitors pick options and add to their request.

type World = "all" | WorldSlug;
type Sort = "popular" | "new" | "price-asc" | "price-desc" | "name";
type RefineKey = "price" | "size" | "length" | "colour" | "std";
type State = {
  q: string;
  use: string | null;
  world: World;
  cat: string | null;
  refine: Record<RefineKey, string[]>;
  isNew: boolean;
  sort: Sort;
};

const PAGE = 36;
const SORTS: { key: Sort; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "new", label: "New first" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name A–Z" },
];
const PRICE_BUCKETS: [string, string, number, number][] = [
  ["0-25", "Under €25", 0, 25],
  ["25-50", "€25 – €50", 25, 50],
  ["50-100", "€50 – €100", 50, 100],
  ["100-250", "€100 – €250", 100, 250],
  ["250-500", "€250 – €500", 250, 500],
  ["500+", "€500 and over", 500, Infinity],
];
const REFINES: { key: RefineKey; label: string; help: string }[] = [
  { key: "price", label: "Price", help: filterHelp.price },
  { key: "size", label: "Size", help: filterHelp.size },
  { key: "length", label: "Length", help: filterHelp.length },
  { key: "colour", label: "Colour", help: filterHelp.colour },
  { key: "std", label: "Safety standard", help: filterHelp.standard },
];
const emptyRefine = (): Record<RefineKey, string[]> => ({ price: [], size: [], length: [], colour: [], std: [] });

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/,/g, ".");
const valuesOf = (it: ExplorerItem, key: RefineKey): string[] => {
  switch (key) {
    case "price":
      return PRICE_BUCKETS.filter(([, , lo, hi]) => it.price >= lo && it.price < hi).map(([k]) => k);
    case "size":
      return it.sizes;
    case "length":
      return it.lengths;
    case "colour":
      return it.colours;
    case "std":
      return it.stds;
  }
};
const labelOf = (key: RefineKey, v: string) => (key === "price" ? (PRICE_BUCKETS.find(([k]) => k === v)?.[1] ?? v) : v);
const catLabel = (cat: string) => {
  const [w, s] = cat.split("/");
  return getSubcategory(w, s)?.name ?? cat;
};

type Skip = "q" | "use" | "world" | "cat" | RefineKey | "isNew" | null;

type ExplorerProps = {
  items: ExplorerItem[];
  initialWorld?: WorldSlug;
  initialCat?: string;
  kicker: string;
  title: string;
  lede: string;
};

/** Reads filters from the URL (?q=&use=&cat=…). Wrap in Suspense with <ShopExplorer> as the static fallback. */
export function ShopExplorerFromUrl(props: ExplorerProps) {
  const sp = useSearchParams();
  const fromUrl: Partial<State> = {};
  if (sp.get("q")) fromUrl.q = sp.get("q")!;
  if (sp.get("use")) fromUrl.use = sp.get("use");
  const w = sp.get("world");
  if (w === "sport" || w === "professional") fromUrl.world = w;
  if (sp.get("cat")) fromUrl.cat = sp.get("cat");
  if (sp.get("new") === "1") fromUrl.isNew = true;
  const sort = SORTS.find((x) => x.key === sp.get("sort"))?.key;
  if (sort) fromUrl.sort = sort;
  const refine = emptyRefine();
  (Object.keys(refine) as RefineKey[]).forEach((k) => (refine[k] = sp.getAll(k)));
  fromUrl.refine = refine;
  return <ShopExplorer {...props} fromUrl={fromUrl} />;
}

export function ShopExplorer({ items, initialWorld, initialCat, kicker, title, lede, fromUrl }: ExplorerProps & { fromUrl?: Partial<State> }) {
  const [st, setSt] = useState<State>(() => ({
    q: "",
    use: null,
    world: initialWorld ?? "all",
    cat: initialCat ?? null,
    refine: emptyRefine(),
    isNew: false,
    sort: "popular",
    ...fromUrl,
  }));
  const [shown, setShown] = useState(PAGE);
  const [quick, setQuick] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  // Keep the URL in sync so filtered views can be shared and survive a reload.
  const synced = useRef(false);
  useEffect(() => {
    if (!synced.current) {
      synced.current = true;
      if (!fromUrl) return;
    }
    const sp = new URLSearchParams();
    if (st.q) sp.set("q", st.q);
    if (st.use) sp.set("use", st.use);
    if (st.world !== (initialWorld ?? "all")) sp.set("world", st.world);
    if (st.cat && st.cat !== initialCat) sp.set("cat", st.cat);
    if (st.isNew) sp.set("new", "1");
    if (st.sort !== "popular") sp.set("sort", st.sort);
    (Object.keys(st.refine) as RefineKey[]).forEach((k) => st.refine[k].forEach((v) => sp.append(k, v)));
    const qs = sp.toString();
    window.history.replaceState(window.history.state, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, [st, initialWorld, initialCat, fromUrl]);

  const terms = useMemo(() => fold(st.q).split(/\s+/).filter(Boolean), [st.q]);
  const hay = useMemo(
    () => new Map(items.map((it) => [it.slug, fold([it.name, it.catName, ...it.use, ...it.colours, ...it.sizes, ...it.lengths, ...it.stds, ...it.chips, ...it.skus].join(" "))])),
    [items],
  );

  const matches = useCallback(
    (it: ExplorerItem, skip: Skip = null) => {
      if (skip !== "q" && terms.length && !terms.every((t) => hay.get(it.slug)!.includes(t))) return false;
      if (skip !== "use" && st.use && !it.use.includes(st.use)) return false;
      if (skip !== "world" && st.world !== "all" && !it.cats.some((c) => c.startsWith(st.world + "/"))) return false;
      if (skip !== "cat" && st.cat && !it.cats.includes(st.cat)) return false;
      if (skip !== "isNew" && st.isNew && !it.isNew) return false;
      for (const k of Object.keys(st.refine) as RefineKey[]) {
        if (skip === k || !st.refine[k].length) continue;
        const vs = valuesOf(it, k);
        if (!st.refine[k].some((v) => vs.includes(v))) return false;
      }
      return true;
    },
    [terms, hay, st],
  );

  const results = useMemo(() => {
    const r = items.filter((it) => matches(it));
    const by: Record<Sort, (a: ExplorerItem, b: ExplorerItem) => number> = {
      popular: (a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)) || a.rank - b.rank,
      new: (a, b) => Number(b.isNew) - Number(a.isNew) || Number(Boolean(b.image)) - Number(Boolean(a.image)) || a.rank - b.rank,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return r.sort(by[st.sort]);
  }, [items, matches, st.sort]);

  // Counts that ignore their own selection, so every option shows what picking it would give.
  const counts = useMemo(() => {
    const use: Record<string, number> = {};
    const world: Record<string, number> = { all: 0, sport: 0, professional: 0 };
    const cat: Record<string, number> = {};
    const refine = Object.fromEntries(REFINES.map((r) => [r.key, {} as Record<string, number>])) as Record<RefineKey, Record<string, number>>;
    let isNew = 0;
    for (const it of items) {
      if (matches(it, "use")) it.use.forEach((u) => (use[u] = (use[u] ?? 0) + 1));
      if (matches(it, "world")) {
        world.all++;
        if (it.cats.some((c) => c.startsWith("sport/"))) world.sport++;
        if (it.cats.some((c) => c.startsWith("professional/"))) world.professional++;
      }
      if (matches(it, "cat")) it.cats.forEach((c) => (cat[c] = (cat[c] ?? 0) + 1));
      if (matches(it, "isNew") && it.isNew) isNew++;
      for (const r of REFINES) if (matches(it, r.key)) valuesOf(it, r.key).forEach((v) => (refine[r.key][v] = (refine[r.key][v] ?? 0) + 1));
    }
    const useAll = items.filter((it) => matches(it, "use")).length;
    const catAll = items.filter((it) => matches(it, "cat")).length;
    return { use, useAll, world, cat, catAll, refine, isNew };
  }, [items, matches]);

  const update = (patch: Partial<State>) => {
    setSt((s) => ({ ...s, ...patch }));
    setShown(PAGE);
  };
  const toggleRefine = (key: RefineKey, v: string) =>
    update({ refine: { ...st.refine, [key]: st.refine[key].includes(v) ? st.refine[key].filter((x) => x !== v) : [...st.refine[key], v] } });
  const clearAll = () => update({ q: "", use: null, world: initialWorld ?? "all", cat: initialCat ?? null, refine: emptyRefine(), isNew: false });

  const active: { label: string; clear: () => void }[] = [
    ...(st.q ? [{ label: `“${st.q}”`, clear: () => update({ q: "" }) }] : []),
    ...(st.use ? [{ label: st.use, clear: () => update({ use: null }) }] : []),
    ...(st.world !== "all" ? [{ label: worlds.find((w) => w.slug === st.world)!.name, clear: () => update({ world: "all", cat: null }) }] : []),
    ...(st.cat ? [{ label: catLabel(st.cat), clear: () => update({ cat: null }) }] : []),
    ...(st.isNew ? [{ label: "New for 2026", clear: () => update({ isNew: false }) }] : []),
    ...REFINES.flatMap((r) => st.refine[r.key].map((v) => ({ label: `${r.label}: ${labelOf(r.key, v)}`, clear: () => toggleRefine(r.key, v) }))),
  ];

  const guide = st.cat ? categoryGuide[st.cat] : null;
  const useGuide = st.use ? uses.find((u) => u.value === st.use) : null;

  const categoryList = (
    <CategoryList st={st} counts={counts} onPick={(cat) => update({ cat, world: cat ? (cat.split("/")[0] as WorldSlug) : st.world })} />
  );
  const refinePanel = <RefinePanel st={st} counts={counts} onToggle={toggleRefine} onNew={(v) => update({ isNew: v })} />;

  return (
    <div className="bg-white">
      {/* header */}
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <p className="kicker flex items-center gap-2.5 text-muted">
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-brand" />
            {kicker}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.02]">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{lede}</p>
          <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-muted">
            {["Prices incl. 18% VAT", "Send a request, we confirm price and delivery", "Advice from the engineers who inspect it"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span aria-hidden className="grid size-5 place-items-center rounded-full bg-brand-strong text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div aria-hidden className="relative mt-7 h-0.5 bg-[repeating-linear-gradient(90deg,#d6d6d3_0_7px,transparent_7px_13px)]">
            <div className="absolute inset-y-0 left-0 w-full origin-left animate-[shop-rope_1.6s_cubic-bezier(.22,.8,.24,1)_both] bg-brand" />
            <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-[shop-ride_14s_ease-in-out_-3s_infinite_alternate] rounded-full border-2 border-brand bg-white shadow-[0_0_12px_rgba(229,72,77,.45)]" />
          </div>
        </div>

        {/* what is it for? */}
        <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <p id="use-label" className="kicker text-ink">What is it for?</p>
          <div role="group" aria-labelledby="use-label" className="-mx-4 mt-3 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <UseButton icon="all" label="Everything" help="The whole EDELRID range." count={counts.useAll} selected={!st.use} onClick={() => update({ use: null })} />
            {uses.map((u) => (
              <UseButton key={u.value} icon={u.icon} label={u.label} help={u.help} count={counts.use[u.value] ?? 0} selected={st.use === u.value} onClick={() => update({ use: st.use === u.value ? null : u.value })} />
            ))}
          </div>
        </div>
      </header>

      {/* toolbar */}
      <div className="z-30 border-b border-line bg-white/95 backdrop-blur lg:sticky lg:top-[72px]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <label className="relative min-w-0 basis-full sm:basis-auto sm:flex-[1_1_18rem]">
            <span className="sr-only">Search the shop</span>
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={st.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search: harness, 60 m rope, helmet, item number…"
              className="h-12 w-full rounded-lg border border-line bg-mist pl-11 pr-4 text-[15px] outline-none transition-colors placeholder:text-muted/80 hover:border-ink/30 focus:border-ink focus:bg-white"
            />
          </label>
          <div role="group" aria-label="Range" className="flex min-w-0 flex-1 rounded-lg border border-line p-1 sm:flex-none">
            {(["all", "sport", "professional"] as World[]).map((w) => (
              <button
                key={w}
                type="button"
                aria-pressed={st.world === w}
                onClick={() => update({ world: w, cat: st.cat && w !== "all" && !st.cat.startsWith(w) ? null : st.cat })}
                className={clsx(
                  "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-semibold transition-colors sm:flex-none sm:px-4",
                  st.world === w ? "bg-ink text-white" : "text-ink/75 hover:bg-mist hover:text-ink",
                )}
              >
                {w === "all" ? "All" : worlds.find((x) => x.slug === w)!.name}
                <span className={clsx("hidden text-xs tabular-nums sm:inline", st.world === w ? "text-white/60" : "text-muted")}>{counts.world[w]}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSheet(true)}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold hover:border-ink/40 lg:hidden"
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            Filters
            {active.length > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-brand-strong px-1 text-[11px] text-white">{active.length}</span>}
          </button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-40 max-h-[calc(100dvh-11rem)] space-y-8 overflow-y-auto pb-6 pr-2 [scrollbar-width:thin]">
            {categoryList}
            {refinePanel}
          </div>
        </aside>

        <section aria-live="polite" aria-label="Products" className="min-w-0">
          {(guide || useGuide) && (
            <div className="mb-6 flex gap-4 rounded-xl border border-line bg-mist p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-white text-ink">
                <ShopIcon name={guide ? guide.icon : useGuide!.icon} className="size-8" />
              </span>
              <div>
                <p className="font-display text-lg">{guide ? catLabel(st.cat!) : useGuide!.label}</p>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{guide ? guide.what : useGuide!.help}</p>
                {guide && useGuide && <p className="mt-2 text-xs text-muted">Showing items for {useGuide.label.toLowerCase()}.</p>}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <strong className="font-display text-xl text-ink tabular-nums">{results.length}</strong> {results.length === 1 ? "product" : "products"}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Sort</span>
              <span className="relative">
                <select
                  value={st.sort}
                  onChange={(e) => update({ sort: e.target.value as Sort })}
                  className="h-10 appearance-none rounded-md border border-line bg-white pl-3 pr-9 text-sm font-semibold outline-none hover:border-ink/40 focus:border-ink"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              </span>
            </label>
          </div>

          {active.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {active.map((a) => (
                <li key={a.label}>
                  <button
                    type="button"
                    onClick={a.clear}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink/15 bg-mist pl-3 pr-2 text-xs font-semibold hover:border-ink/40"
                  >
                    {a.label}
                    <X aria-label={`Remove ${a.label}`} className="size-3.5" />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clearAll} className="h-8 px-2 text-xs font-semibold text-brand-strong hover:underline">
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {results.length ? (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {results.slice(0, shown).map((it, i) => (
                <ProductTile key={it.slug} it={it} priority={i < 4} onQuick={() => setQuick(it.slug)} />
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-line px-6 py-14 text-center">
              <p className="font-semibold">No products match these filters.</p>
              <p className="mt-1 text-sm text-muted">Remove a filter, try another word, or send us a request and we will find it for you.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={clearAll} className="h-11 rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-3">
                  Clear all filters
                </button>
                <Link href="/quote" className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm font-semibold hover:border-ink/40">
                  Ask us for an item
                </Link>
              </div>
            </div>
          )}
          {results.length > shown && (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="h-11 rounded-md border border-line px-6 text-sm font-semibold hover:border-ink/40">
                Show more ({results.length - shown} left)
              </button>
            </div>
          )}
        </section>
      </div>

      <FilterSheet open={sheet} onClose={() => setSheet(false)} count={results.length} onClear={clearAll}>
        {categoryList}
        {refinePanel}
      </FilterSheet>
      <QuickView slug={quick} onClose={() => setQuick(null)} />
    </div>
  );
}

function UseButton({ icon, label, help, count, selected, onClick }: { icon: React.ComponentProps<typeof ShopIcon>["name"]; label: string; help: string; count: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={!count && !selected}
      title={help}
      className={clsx(
        "group flex min-w-[10.5rem] shrink-0 snap-start items-center gap-3 rounded-xl border p-3 pr-4 text-left transition-colors disabled:opacity-40",
        selected ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40",
      )}
    >
      <ShopIcon name={icon} className={clsx("size-8 shrink-0", selected ? "text-white" : "text-ink")} />
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-tight">{label}</span>
        <span className={clsx("mt-0.5 block text-xs tabular-nums", selected ? "text-white/60" : "text-muted")}>{count} products</span>
      </span>
    </button>
  );
}

type Counts = {
  cat: Record<string, number>;
  catAll: number;
  refine: Record<RefineKey, Record<string, number>>;
  isNew: number;
};

function CategoryList({ st, counts, onPick }: { st: State; counts: Counts; onPick: (cat: string | null) => void }) {
  const groups = worlds.filter((w) => st.world === "all" || w.slug === st.world);
  return (
    <nav aria-label="Categories">
      <h2 className="kicker text-ink">Categories</h2>
      <p className="mt-1 text-xs text-muted">Pick one to see what it is and who it is for.</p>
      <button
        type="button"
        aria-pressed={!st.cat}
        onClick={() => onPick(null)}
        className={clsx(catBtn, !st.cat && catOn)}
      >
        <ShopIcon name="all" className="size-6 shrink-0" />
        <span className="flex-1">All categories</span>
        <span className="text-xs tabular-nums text-muted">{counts.catAll}</span>
      </button>
      {groups.map((w) => (
        <div key={w.slug} className="mt-4">
          <p className="px-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{w.name}</p>
          <ul className="mt-1">
            {w.subcategories.map((s) => {
              const key = `${w.slug}/${s.slug}`;
              const n = counts.cat[key] ?? 0;
              if (!n && st.cat !== key) return null;
              return (
                <li key={key}>
                  <button type="button" aria-pressed={st.cat === key} onClick={() => onPick(st.cat === key ? null : key)} className={clsx(catBtn, st.cat === key && catOn)}>
                    <ShopIcon name={categoryGuide[key]?.icon ?? "acc"} className="size-6 shrink-0" />
                    <span className="flex-1 leading-snug">{s.name}</span>
                    <span className="text-xs tabular-nums text-muted">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
const catBtn =
  "mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm text-ink/80 transition-colors hover:bg-mist hover:text-ink";
const catOn = "bg-mist font-semibold text-ink shadow-[inset_3px_0_0_var(--color-brand)]";

function RefinePanel({ st, counts, onToggle, onNew }: { st: State; counts: Counts; onToggle: (k: RefineKey, v: string) => void; onNew: (v: boolean) => void }) {
  return (
    <div>
      <h2 className="kicker text-ink">Refine</h2>
      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-line px-3 text-sm font-semibold">
        <input type="checkbox" checked={st.isNew} onChange={(e) => onNew(e.target.checked)} className="size-4 accent-[#ce2c31]" />
        New for 2026
        <span className="ml-auto text-xs font-normal tabular-nums text-muted">{counts.isNew}</span>
      </label>
      {REFINES.map((r) => (
        <RefineGroup key={r.key} def={r} selected={st.refine[r.key]} counts={counts.refine[r.key]} onToggle={(v) => onToggle(r.key, v)} />
      ))}
    </div>
  );
}

function RefineGroup({ def, selected, counts, onToggle }: { def: (typeof REFINES)[number]; selected: string[]; counts: Record<string, number>; onToggle: (v: string) => void }) {
  const [all, setAll] = useState(false);
  const values = Object.keys(counts);
  for (const v of selected) if (!values.includes(v)) values.push(v);
  if (def.key === "price") values.sort((a, b) => PRICE_BUCKETS.findIndex(([k]) => k === a) - PRICE_BUCKETS.findIndex(([k]) => k === b));
  else if (def.key === "size") values.sort(compareSizes);
  else if (def.key === "length") values.sort(compareLengths);
  else values.sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0) || a.localeCompare(b));
  if (!values.length) return null;
  const limit = 8;
  const visible = all ? values : values.slice(0, limit);
  return (
    <details open={def.key === "price" || selected.length > 0} className="group mt-3 border-b border-line pb-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span>
          {def.label}
          {selected.length > 0 && <span className="ml-2 rounded-full bg-brand-strong px-1.5 py-0.5 text-[10px] text-white">{selected.length}</span>}
        </span>
        <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <p className="mb-2 flex gap-1.5 text-xs leading-relaxed text-muted">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {def.help}
      </p>
      <ul className={def.key === "colour" ? "grid grid-cols-1 gap-0.5" : "grid gap-0.5"}>
        {visible.map((v) => (
          <li key={v}>
            <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-1.5 text-sm hover:bg-mist">
              <input type="checkbox" checked={selected.includes(v)} onChange={() => onToggle(v)} className="size-4 accent-[#ce2c31]" />
              {def.key === "colour" && <span aria-hidden className="size-4 shrink-0 rounded-full border border-ink/15" style={{ background: colourFill(v) }} />}
              <span className="flex-1">{labelOf(def.key, v)}</span>
              <span className="text-xs tabular-nums text-muted">{counts[v] ?? 0}</span>
            </label>
          </li>
        ))}
      </ul>
      {values.length > limit && (
        <button type="button" onClick={() => setAll((a) => !a)} className="mt-1 px-1.5 text-xs font-semibold text-brand-strong hover:underline">
          {all ? "Show fewer" : `Show all ${values.length}`}
        </button>
      )}
    </details>
  );
}

function ProductTile({ it, priority, onQuick }: { it: ExplorerItem; priority: boolean; onQuick: () => void }) {
  const open = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onQuick();
  };
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-[border-color,box-shadow] hover:border-ink/25 hover:shadow-[0_18px_40px_-28px_rgba(20,20,20,.45)]">
      <div className="relative aspect-square bg-mist">
        {it.image ? (
          <Image src={it.image} alt="" fill priority={priority} sizes="(min-width:1280px) 240px, (min-width:768px) 30vw, 45vw" className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="grid h-full place-items-center text-ink/70">
            <ShopIcon name={categoryGuide[it.cat]?.icon ?? "acc"} className="size-16" />
          </div>
        )}
        {it.isNew && <span className="absolute left-2.5 top-2.5 rounded bg-brand-strong px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">New</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{it.catName}</p>
        <h3 className="text-sm font-semibold leading-snug sm:text-[15px]">
          <Link href={it.href} onClick={open} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {it.name}
          </Link>
        </h3>
        {it.chips.length > 0 && <p className="text-xs text-muted">{it.chips.join(" · ")}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-[11px] text-muted">{it.variants > 1 ? "from" : "price"}</p>
            <p className="font-display text-base tabular-nums">
              {formatPrice(it.price)}
              {it.unit && <span className="ml-1 font-sans text-xs font-medium text-muted">{it.unit}</span>}
            </p>
            {it.colours.length > 1 && (
              <span className="mt-1.5 flex items-center gap-1" aria-label={`${it.colours.length} colours`}>
                {it.colours.slice(0, 5).map((c) => (
                  <i key={c} className="size-3 rounded-full border border-ink/15" style={{ background: colourFill(c) }} />
                ))}
                {it.colours.length > 5 && <em className="text-[11px] not-italic text-muted">+{it.colours.length - 5}</em>}
              </span>
            )}
          </div>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-lg leading-none transition-colors group-hover:border-brand-strong group-hover:bg-brand-strong group-hover:text-white"
          >
            +
          </span>
        </div>
      </div>
    </li>
  );
}

function FilterSheet({ open, onClose, count, onClear, children }: { open: boolean; onClose: () => void; count: number; onClear: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="Filters"
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-2xl bg-white p-0 text-ink backdrop:bg-black/50 lg:hidden"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
        <p className="font-display text-lg">Filters</p>
        <button type="button" onClick={onClose} aria-label="Close filters" className="grid size-10 place-items-center rounded-full border border-line">
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <div className="space-y-8 px-5 py-5">{children}</div>
      <div className="sticky bottom-0 flex gap-3 border-t border-line bg-white px-5 py-4">
        <button type="button" onClick={onClear} className="h-12 rounded-md border border-line px-4 text-sm font-semibold">
          Clear all
        </button>
        <button type="button" onClick={onClose} className="h-12 flex-1 rounded-md bg-brand-strong text-sm font-semibold text-white">
          Show {count} products
        </button>
      </div>
    </dialog>
  );
}
