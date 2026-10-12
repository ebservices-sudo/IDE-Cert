import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { subcategoryHref, worlds } from "@/config/catalog";
import { getCatalog } from "@/lib/catalog/data";
import { buildListing, parseListingState } from "@/lib/catalog/listing";
import { PageHeader } from "@/components/layout/PageHeader";
import { ListingSkeleton, ListingView } from "@/components/shop/ListingView";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the EDELRID range at IDE Cert by product name, category or item number.",
  robots: { index: false, follow: true },
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <PageHeader kicker="Shop" title="Search" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}>
        <Suspense fallback={<SearchBox />}>
          <SearchBoxWithQuery searchParams={searchParams} />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<ListingSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function SearchBoxWithQuery({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  return <SearchBox q={typeof q === "string" ? q : ""} />;
}

function SearchBox({ q = "" }: { q?: string }) {
  return (
    <form action="/search" method="get" role="search" className="mt-6 flex max-w-xl items-center gap-2">
      <label className="flex h-12 flex-1 items-center gap-3 rounded-md bg-white px-4 text-ink">
        <Search aria-hidden className="size-5 text-muted" />
        <input
          key={q}
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Product name, category or item number"
          aria-label="Search products"
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
      <button type="submit" className="h-12 rounded-md bg-brand-strong px-5 text-sm font-semibold text-white hover:bg-brand">
        Search
      </button>
    </form>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const state = parseListingState(await searchParams, "relevance");
  const listing = buildListing((await getCatalog()).products, state, { categories: true });
  return (
    <ListingView
      listing={listing}
      basePath="/search"
      defaultSort="relevance"
      empty={
        <>
          <p className="font-semibold">{state.q ? `Nothing found for “${state.q}”.` : "No products match these filters."}</p>
          <p className="mt-2 text-sm text-muted">
            Try another spelling or an EDELRID item number, browse a category, or{" "}
            <Link href="/contact" className="font-semibold text-brand-strong hover:underline">
              ask us
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {worlds.flatMap((w) =>
              w.subcategories
                .filter((s) => s.featured)
                .map((s) => (
                  <Link
                    key={`${w.slug}/${s.slug}`}
                    href={subcategoryHref(w.slug, s.slug)}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:border-ink/40"
                  >
                    {s.name}
                  </Link>
                )),
            )}
          </div>
        </>
      }
    />
  );
}
