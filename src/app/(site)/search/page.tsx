import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { subcategoryHref, worlds } from "@/config/catalog";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBox } from "@/components/shop/SearchBox";
import { ListingClient, ListingSkeleton } from "@/components/shop/ListingView";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the EDELRID range at IDE Cert by product name, category or item number.",
  robots: { index: false, follow: true },
};

/** Static page; the query is read and searched in the browser (see ListingView). */
export default function SearchPage() {
  return (
    <>
      <PageHeader kicker="Shop" title="Search" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}>
        <Suspense fallback={<SearchBox />}>
          <SearchBox fromUrl />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<ListingSkeleton />}>
        <ListingClient
          initial={null}
          basePath="/search"
          defaultSort="relevance"
          empty={
            <>
              <p className="font-semibold">No products found.</p>
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
      </Suspense>
    </>
  );
}
