"use client";

import { createContext, use, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ListingState, type SortKey, toSearch } from "@/lib/catalog/listing";

// Holds the listing's URL state (filters, sort, query). Changes update the
// checkboxes immediately (optimistic) and then replace the URL, which
// re-renders the server-side results.

type Ctx = {
  state: ListingState;
  defaultSort: SortKey;
  isPending: boolean;
  toggle: (key: string, value: string) => void;
  clear: (key?: string) => void;
  setSort: (sort: SortKey) => void;
};

const ListingContext = createContext<Ctx | null>(null);

export function useListing() {
  const ctx = use(ListingContext);
  if (!ctx) throw new Error("useListing must be used inside <ListingProvider>");
  return ctx;
}

export function ListingProvider({
  state,
  defaultSort,
  basePath,
  children,
}: {
  state: ListingState;
  defaultSort: SortKey;
  basePath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(state);

  const go = (change: ListingState) => {
    const next = { ...change, page: 1 };
    startTransition(() => {
      setOptimistic(next);
      router.replace(`${basePath}${toSearch(next, defaultSort)}`, { scroll: false });
    });
  };

  const value: Ctx = {
    state: optimistic,
    defaultSort,
    isPending,
    toggle(key, v) {
      const current = optimistic.filters[key] ?? [];
      const values = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
      const filters = { ...optimistic.filters, [key]: values };
      if (!values.length) delete filters[key];
      go({ ...optimistic, filters });
    },
    clear(key) {
      if (!key) return go({ ...optimistic, filters: {} });
      const filters = { ...optimistic.filters };
      delete filters[key];
      go({ ...optimistic, filters });
    },
    setSort(sort) {
      go({ ...optimistic, sort });
    },
  };

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
