"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Facet } from "@/lib/catalog/listing";
import { useListing } from "./ListingProvider";

const LIMIT = 8;

export function FacetPanel({ facets, idPrefix }: { facets: Facet[]; idPrefix: string }) {
  if (!facets.length) return <p className="py-4 text-sm text-muted">No filters for this selection.</p>;
  return (
    <div className="divide-y divide-line border-y border-line">
      {facets.map((f, i) => (
        <FacetGroup key={f.key} facet={f} idPrefix={idPrefix} defaultOpen={i < 6} />
      ))}
    </div>
  );
}

function FacetGroup({ facet, idPrefix, defaultOpen }: { facet: Facet; idPrefix: string; defaultOpen: boolean }) {
  const { state, toggle, clear } = useListing();
  const [expanded, setExpanded] = useState(false);
  const selected = state.filters[facet.key] ?? [];

  if (facet.kind === "toggle") {
    const v = facet.values[0];
    const id = `${idPrefix}-${facet.key}`;
    const checked = selected.includes(v.value);
    return (
      <div className="py-3.5">
        <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input
            id={id}
            type="checkbox"
            name={facet.key}
            value={v.value}
            checked={checked}
            onChange={() => toggle(facet.key, v.value)}
            className="size-4 accent-brand-strong"
          />
          <span className="flex-1">{facet.label}</span>
          <span className="text-xs font-normal tabular-nums text-muted">{v.count}</span>
        </label>
      </div>
    );
  }

  // Keep selected values visible even when the list is collapsed.
  const visible = expanded
    ? facet.values
    : facet.values.filter((v, i) => i < LIMIT || selected.includes(v.value));
  const hidden = facet.values.length - visible.length;

  return (
    <details open={defaultOpen || selected.length > 0} className="group py-3.5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span>
          {facet.label}
          {selected.length > 0 && (
            <span className="ml-2 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
              {selected.length}
            </span>
          )}
        </span>
        <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <fieldset className="mt-3">
        <legend className="sr-only">{facet.label}</legend>
        <ul className="space-y-1">
          {visible.map((v) => {
            const id = `${idPrefix}-${facet.key}-${v.value}`.replace(/[^\w-]+/g, "_");
            const checked = selected.includes(v.value);
            const disabled = !checked && v.count === 0;
            return (
              <li key={v.value}>
                <label
                  htmlFor={id}
                  className={`flex items-center gap-3 rounded px-1 py-1 text-sm ${disabled ? "cursor-default text-muted/60" : "cursor-pointer hover:bg-mist"}`}
                >
                  <input
                    id={id}
                    type="checkbox"
                    name={facet.key}
                    value={v.value}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggle(facet.key, v.value)}
                    className="size-4 shrink-0 accent-brand-strong"
                  />
                  <span className="min-w-0 flex-1 break-words">{v.label}</span>
                  <span className="text-xs tabular-nums text-muted">{v.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex gap-4 text-xs font-semibold">
          {(hidden > 0 || expanded) && facet.values.length > LIMIT && (
            <button type="button" onClick={() => setExpanded((e) => !e)} className="text-brand-strong hover:underline">
              {expanded ? "Show fewer" : `Show all ${facet.values.length}`}
            </button>
          )}
          {selected.length > 0 && (
            <button type="button" onClick={() => clear(facet.key)} className="text-muted hover:text-ink hover:underline">
              Clear
            </button>
          )}
        </div>
      </fieldset>
    </details>
  );
}
