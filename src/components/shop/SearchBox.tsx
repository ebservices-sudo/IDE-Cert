"use client";

import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/** Search form for the /search page header. `fromUrl` prefills the current query. */
export function SearchBox({ fromUrl = false }: { fromUrl?: boolean }) {
  return fromUrl ? <SearchBoxFromUrl /> : <SearchBoxInner q="" />;
}

function SearchBoxFromUrl() {
  const q = useSearchParams().get("q") ?? "";
  return <SearchBoxInner key={q} q={q} />;
}

function SearchBoxInner({ q }: { q: string }) {
  return (
    <form action="/search" method="get" role="search" className="mt-6 flex max-w-xl items-center gap-2">
      <label className="flex h-12 flex-1 items-center gap-3 rounded-md bg-white px-4 text-ink">
        <Search aria-hidden className="size-5 text-muted" />
        <input
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
