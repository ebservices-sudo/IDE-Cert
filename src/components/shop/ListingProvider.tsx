"use client";

import { createContext, use } from "react";
import type { ListingState, SortKey } from "@/lib/catalog/listing";

// Listing state shared by the filter panel, toolbar and results. The live
// version (ListingClient) is driven by the URL; the static version (server
// HTML before hydration) has no-op handlers.

export type ListingCtx = {
  state: ListingState;
  defaultSort: SortKey;
  isPending: boolean;
  toggle: (key: string, value: string) => void;
  clear: (key?: string) => void;
  setSort: (sort: SortKey) => void;
  showMore: () => void;
};

const ListingContext = createContext<ListingCtx | null>(null);

export function useListing() {
  const ctx = use(ListingContext);
  if (!ctx) throw new Error("useListing must be used inside <ListingProvider>");
  return ctx;
}

export function ListingProvider({ value, children }: { value: ListingCtx; children: React.ReactNode }) {
  return <ListingContext value={value}>{children}</ListingContext>;
}

/** Dims the results while a filter change is loading. */
export function ResultsRegion({ children }: { children: React.ReactNode }) {
  const { isPending } = useListing();
  return (
    <div aria-busy={isPending} className={isPending ? "opacity-50 transition-opacity duration-200" : "transition-opacity duration-200"}>
      {children}
    </div>
  );
}
