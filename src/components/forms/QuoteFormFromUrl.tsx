"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PricedCart } from "@/lib/orders/pricing";
import { QuoteForm, type QuoteFormItem } from "./QuoteForm";

/** /quote?sku=… prefills products; names come from /api/cart (the catalogue). */
export function QuoteFormFromUrl() {
  const skus = useSearchParams()
    .getAll("sku")
    .filter((s) => /^\d{12}$/.test(s))
    .slice(0, 20);
  const key = skus.join(",");
  const [items, setItems] = useState<{ key: string; items: QuoteFormItem[] } | null>(null);

  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: key.split(",").map((sku) => ({ sku, qty: 1 })) }),
      signal: ctrl.signal,
    })
      .then((r) => r.json() as Promise<PricedCart>)
      .then((data) =>
        setItems({
          key,
          items: data.lines.map((l, i) => ({
            key: `p${i}`,
            sku: l.sku,
            name: [l.name, l.optionsText].filter(Boolean).join(" · "),
            quantity: "",
            details: "",
          })),
        }),
      )
      .catch(() => {
        if (!ctrl.signal.aborted) setItems({ key, items: [] });
      });
    return () => ctrl.abort();
  }, [key]);

  if (!key) return <QuoteForm initialItems={[]} />;
  if (items?.key !== key) return <div aria-busy className="h-96 animate-pulse rounded-xl bg-mist" />;
  return <QuoteForm initialItems={items.items} />;
}
