"use client";

import { useEffect, useState } from "react";
import type { PricedCart } from "@/lib/orders/pricing";
import { useCart } from "./store";

/** The cart from localStorage, priced by the server (/api/cart). */
export function usePricedCart() {
  const cart = useCart();
  const key = JSON.stringify(cart.lines.map((l) => [l.sku, l.qty]));
  const [state, setState] = useState<{ key: string; data: PricedCart | null; error: boolean }>({ key: "", data: null, error: false });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: cart.lines.map(({ sku, qty }) => ({ sku, qty })) }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? (r.json() as Promise<PricedCart>) : Promise.reject(r.status)))
      .then((data: PricedCart) => setState({ key, data, error: false }))
      .catch((e) => {
        if (!ctrl.signal.aborted) setState((s) => ({ ...s, key, error: Boolean(e) }));
      });
    return () => ctrl.abort();
    // `key` captures the lines that matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    ...cart,
    priced: state.data,
    /** True while the shown prices belong to an older version of the cart. */
    stale: state.key !== key,
    error: state.error,
  };
}
