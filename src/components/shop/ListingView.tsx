import Link from "next/link";
import { type Listing, PAGE_SIZE, type SortKey, toSearch } from "@/lib/catalog/listing";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
import { FacetPanel } from "./FacetPanel";
import { ListingProvider, ResultsRegion } from "./ListingProvider";
import { ListingToolbar } from "./ListingToolbar";

const CATEGORY_SORTS: SortKey[] = ["popular", "new", "price-asc", "price-desc", "name-asc", "name-desc"];
const SEARCH_SORTS: SortKey[] = ["relevance", ...CATEGORY_SORTS];

export function ListingView({
  listing,
  basePath,
  defaultSort = "popular",
  empty,
}: {
  listing: Listing;
  basePath: string;
  defaultSort?: SortKey;
  empty?: React.ReactNode;
}) {
  const { results, total, facets, state } = listing;
  const sorts = defaultSort === "relevance" ? SEARCH_SORTS : CATEGORY_SORTS;
  const shown = results.slice(0, state.page * PAGE_SIZE);
  const more = total - shown.length;
  return (
    <ListingProvider state={state} defaultSort={defaultSort} basePath={basePath}>
      <Container className="py-10 lg:py-12">
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10">
          <aside aria-label="Filters" className="hidden lg:block">
            <h2 className="kicker mb-3 text-muted">Filter</h2>
            <FacetPanel facets={facets} idPrefix="d" />
          </aside>
          <div className="min-w-0">
            <ListingToolbar total={total} facets={facets} sorts={sorts} />
            <ResultsRegion>
              {results.length ? (
                <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3">
                  {shown.map((p, i) => (
                    <li key={p.id}>
                      <ProductCard product={p} preload={i < 2} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {more > 0 && (
                <div className="mt-12 flex flex-col items-center gap-3">
                  <p className="text-sm text-muted tabular-nums">
                    Showing {shown.length} of {total}
                  </p>
                  <Link
                    href={`${basePath}${toSearch({ ...state, page: state.page + 1 }, defaultSort)}`}
                    scroll={false}
                    className="inline-flex h-11 items-center rounded-md border border-ink px-6 text-sm font-semibold hover:bg-ink hover:text-white"
                  >
                    Show {Math.min(more, PAGE_SIZE)} more
                  </Link>
                </div>
              )}
              {!results.length && (
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
    </ListingProvider>
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
