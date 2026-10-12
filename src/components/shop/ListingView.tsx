"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ListingResult } from "@/lib/catalog/cards";
import { type ListingState, PAGE_SIZE, type SortKey, parseListingState, toSearch } from "@/lib/catalog/listing";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
import { FacetPanel } from "./FacetPanel";
import { type ListingCtx, ListingProvider, ResultsRegion, useListing } from "./ListingProvider";
import { ListingToolbar } from "./ListingToolbar";

// Product listings. The server renders the unfiltered listing as static HTML
// (<ListingStatic>, used as the Suspense fallback); in the browser
// <ListingClient> takes over, reads filters from the URL and loads matching
// products from /api/listing. Filtering never needs a server render.

const CATEGORY_SORTS: SortKey[] = ["popular", "new", "price-asc", "price-desc", "name-asc", "name-desc"];
const SEARCH_SORTS: SortKey[] = ["relevance", ...CATEGORY_SORTS];

type Common = {
  basePath: string;
  defaultSort: SortKey;
  empty?: React.ReactNode;
};

const noop = () => {};

/** Server HTML: the unfiltered listing, before JavaScript loads. */
export function ListingStatic({ initial, ...common }: Common & { initial: ListingResult }) {
  const value: ListingCtx = {
    state: initial.state,
    defaultSort: common.defaultSort,
    isPending: false,
    toggle: noop,
    clear: noop,
    setSort: noop,
    showMore: noop,
  };
  return (
    <ListingProvider value={value}>
      <ListingFrame data={initial} {...common} />
    </ListingProvider>
  );
}

/** Browser: URL-driven filters, sort and paging. */
export function ListingClient({ initial, scope, ...common }: Common & { initial: ListingResult | null; scope?: string }) {
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const sp = useSearchParams();
  const query = sp.toString();
  const urlState = useMemo(() => {
    const params: Record<string, string | string[]> = {};
    for (const key of new Set(sp.keys())) {
      const all = sp.getAll(key);
      params[key] = all.length > 1 ? all : all[0];
    }
    return parseListingState(params, common.defaultSort);
  }, [sp, common.defaultSort]);
  // Checkboxes and sort update at once; results follow when the URL has changed.
  const [state, setOptimistic] = useOptimistic(urlState);

  const useInitial = Boolean(initial) && query === "";
  const [fetched, setFetched] = useState<{ query: string; data: ListingResult } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (useInitial) return;
    const ctrl = new AbortController();
    const url = `/api/listing?${[scope ? `scope=${encodeURIComponent(scope)}` : "", query].filter(Boolean).join("&")}`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<ListingResult>) : Promise.reject(r.status)))
      .then((data) => setFetched({ query, data }))
      .catch(() => {
        if (!ctrl.signal.aborted) setFailed(query);
      });
    return () => ctrl.abort();
  }, [query, scope, useInitial]);

  const data = useInitial ? initial : (fetched?.data ?? initial);
  const isPending = navigating || (!useInitial && fetched?.query !== query && failed !== query);

  const go = (next: ListingState) => {
    // The page is static, so this soft navigation only changes the URL; the
    // effect above then loads the matching products from /api/listing.
    startTransition(() => {
      setOptimistic(next);
      router.replace(`${common.basePath}${toSearch(next, common.defaultSort)}`, { scroll: false });
    });
  };
  const reset = (next: ListingState) => go({ ...next, page: 1 });

  const value: ListingCtx = {
    state,
    defaultSort: common.defaultSort,
    isPending,
    toggle(key, v) {
      const current = state.filters[key] ?? [];
      const values = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
      const filters = { ...state.filters, [key]: values };
      if (!values.length) delete filters[key];
      reset({ ...state, filters });
    },
    clear(key) {
      if (!key) return reset({ ...state, filters: {} });
      const filters = { ...state.filters };
      delete filters[key];
      reset({ ...state, filters });
    },
    setSort(sort) {
      reset({ ...state, sort });
    },
    showMore() {
      go({ ...state, page: state.page + 1 });
    },
  };

  return (
    <ListingProvider value={value}>
      {data ? (
        <ListingFrame data={data} {...common} />
      ) : failed === query ? (
        <Container className="py-16 text-center text-sm text-muted">Could not load products. Please reload the page.</Container>
      ) : (
        <ListingSkeleton />
      )}
    </ListingProvider>
  );
}

function ListingFrame({ data, basePath, defaultSort, empty }: Common & { data: ListingResult }) {
  const { state, showMore } = useListing();
  const { cards, total, facets } = data;
  const sorts = defaultSort === "relevance" ? SEARCH_SORTS : CATEGORY_SORTS;
  const more = total - cards.length;
  return (
    <Container className="py-10 lg:py-12">
      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10">
        <aside aria-label="Filters" className="hidden lg:block">
          <h2 className="kicker mb-3 text-muted">Filter</h2>
          <FacetPanel facets={facets} idPrefix="d" />
        </aside>
        <div className="min-w-0">
          <ListingToolbar total={total} facets={facets} sorts={sorts} />
          <ResultsRegion>
            {cards.length > 0 && (
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
                {cards.map((c, i) => (
                  <li key={c.id}>
                    <ProductCard card={c} preload={i < 2} />
                  </li>
                ))}
              </ul>
            )}
            {more > 0 && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="text-sm text-muted tabular-nums">
                  Showing {cards.length} of {total}
                </p>
                {/* A real link for crawlers and no-JS; JavaScript loads more in place. */}
                <Link
                  href={`${basePath}${toSearch({ ...state, page: state.page + 1 }, defaultSort)}`}
                  scroll={false}
                  onClick={(e) => {
                    e.preventDefault();
                    showMore();
                  }}
                  className="inline-flex h-11 items-center rounded-md border border-ink px-6 text-sm font-semibold hover:bg-ink hover:text-white"
                >
                  Show {Math.min(more, PAGE_SIZE)} more
                </Link>
              </div>
            )}
            {!cards.length && (
              <div className="mt-8 rounded-xl border border-dashed border-line px-6 py-14 text-center">
                {empty ?? (
                  <>
                    <p className="font-semibold">No products match these filters.</p>
                    <p className="mt-2 text-sm text-muted">
                      Remove a filter, or{" "}
                      <Link href="/contact" className="font-semibold text-brand-strong hover:underline">
                        ask us
                      </Link>{" "}
                      — we can order any EDELRID item.
                    </p>
                  </>
                )}
              </div>
            )}
          </ResultsRegion>
        </div>
      </div>
    </Container>
  );
}

export function ListingSkeleton() {
  return (
    <Container className="py-10 lg:py-12" aria-hidden>
      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-mist" />
          ))}
        </div>
        <div>
          <div className="h-10 w-48 animate-pulse rounded bg-mist" />
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i}>
                <div className="aspect-square animate-pulse rounded-lg bg-mist" />
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-mist" />
                <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-mist" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
