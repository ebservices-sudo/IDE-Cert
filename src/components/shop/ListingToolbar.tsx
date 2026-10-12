"use client";

import { useEffect, useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Facet, SortKey } from "@/lib/catalog/listing";
import { sortOptions } from "@/lib/catalog/listing";
import { FacetPanel } from "./FacetPanel";
import { useListing } from "./ListingProvider";

export function ListingToolbar({ total, facets, sorts }: { total: number; facets: Facet[]; sorts: SortKey[] }) {
  const { state, setSort, toggle, clear, isPending } = useListing();
  const dialog = useRef<HTMLDialogElement>(null);
  const activeCount = Object.values(state.filters).reduce((n, v) => n + v.length, 0);

  // Lock page scroll while the mobile filter sheet is open.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () => document.documentElement.style.removeProperty("overflow");
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const open = () => {
    dialog.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  };

  const labelFor = (key: string, value: string) => {
    const f = facets.find((x) => x.key === key);
    if (f?.kind === "toggle") return f.label;
    return f?.values.find((v) => v.value === value)?.label ?? value;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          <span className="font-semibold text-ink tabular-nums">{total}</span> {total === 1 ? "product" : "products"}
          {isPending && <span className="ml-2">Updating…</span>}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={open}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold hover:border-ink/40 lg:hidden"
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-brand-strong px-1.5 text-[11px] font-bold text-white tabular-nums">{activeCount}</span>
            )}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">Sort by</span>
            <select
              value={state.sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-md border border-line bg-white px-2.5 text-sm font-medium hover:border-ink/40"
            >
              {sortOptions
                .filter((o) => sorts.includes(o.key))
                .map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>

      {activeCount > 0 && (
        <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {Object.entries(state.filters).flatMap(([key, values]) =>
            values.map((v) => (
              <li key={`${key}:${v}`}>
                <button
                  type="button"
                  onClick={() => toggle(key, v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-mist py-1 pr-2 pl-3 text-xs font-medium hover:border-ink/40"
                >
                  {labelFor(key, v)}
                  <X aria-hidden className="size-3.5" />
                  <span className="sr-only">Remove filter</span>
                </button>
              </li>
            )),
          )}
          <li>
            <button type="button" onClick={() => clear()} className="px-2 text-xs font-semibold text-brand-strong hover:underline">
              Clear all
            </button>
          </li>
        </ul>
      )}

      <dialog
        ref={dialog}
        aria-label="Filters"
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm bg-white p-0 text-ink backdrop:bg-ink/60"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg">Filters</h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="-mr-2 grid size-10 place-items-center rounded-md hover:bg-mist"
            >
              <X aria-hidden className="size-5" />
              <span className="sr-only">Close filters</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5">
            <FacetPanel facets={facets} idPrefix="m" />
          </div>
          <div className="flex gap-3 border-t border-line p-4">
            <button
              type="button"
              onClick={() => clear()}
              disabled={!activeCount}
              className="h-11 flex-1 rounded-md border border-line text-sm font-semibold disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="h-11 flex-[2] rounded-md bg-brand-strong text-sm font-semibold text-white"
            >
              {isPending ? "Updating…" : `Show ${total} ${total === 1 ? "product" : "products"}`}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
