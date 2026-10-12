"use client";

import { useSyncExternalStore } from "react";

// The cart lives in localStorage so it survives reloads and is shared between
// tabs. Lines hold item numbers only; names and prices are always read from
// the current catalogue, never trusted from the browser.

export type CartLine = {
  /** EDELRID item number. */
  sku: string;
  /** Product slug, for links. */
  slug: string;
  /** Pieces, or metres for cut-to-length rope. */
  qty: number;
};

const KEY = "idecert:cart:v1";
const MAX_QTY = 999;
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return EMPTY;
    return raw
      .filter((l) => l && typeof l.sku === "string" && typeof l.slug === "string" && Number.isFinite(l.qty))
      .map((l) => ({ sku: l.sku, slug: l.slug, qty: clamp(l.qty) }));
  } catch {
    return EMPTY;
  }
}

function clamp(qty: number) {
  return Math.min(MAX_QTY, Math.max(1, Math.round(qty)));
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    lines = read();
    loaded = true;
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: the cart still works for this page view
  }
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    lines = read();
    for (const l of listeners) l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  ensureLoaded();
  return lines;
}

export const cartActions = {
  add(sku: string, slug: string, qty: number, maxQty = MAX_QTY) {
    ensureLoaded();
    const existing = lines.find((l) => l.sku === sku);
    const next = existing
      ? lines.map((l) => (l.sku === sku ? { ...l, qty: Math.min(maxQty, clamp(l.qty + qty)) } : l))
      : [...lines, { sku, slug, qty: Math.min(maxQty, clamp(qty)) }];
    commit(next);
  },
  setQty(sku: string, qty: number, maxQty = MAX_QTY) {
    ensureLoaded();
    commit(lines.map((l) => (l.sku === sku ? { ...l, qty: Math.min(maxQty, clamp(qty)) } : l)));
  },
  remove(sku: string) {
    ensureLoaded();
    commit(lines.filter((l) => l.sku !== sku));
  },
  clear() {
    commit(EMPTY);
  },
};

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  return { lines: current, count: current.length, ...cartActions };
}
