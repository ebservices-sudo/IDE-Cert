"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { shop } from "@/config/site";
import { usePricedCart } from "@/lib/cart/usePricedCart";
import type { PricedLine } from "@/lib/orders/pricing";
import { formatPrice, unitSuffix } from "@/lib/format";

const eur = (cents: number) => formatPrice(cents / 100);

export function CartView() {
  const { lines, priced, stale, error, setQty, remove } = usePricedCart();

  if (!lines.length) {
    return (
      <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center">
        <ShoppingBag aria-hidden className="mx-auto size-8 text-muted" />
        <p className="mt-4 font-semibold">Your cart is empty.</p>
        <p className="mt-1 text-sm text-muted">Browse the EDELRID range and add items to your cart.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/shop/sport" className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-3">
            Shop Sport
          </Link>
          <Link href="/shop/professional" className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-3">
            Shop Professional
          </Link>
        </div>
      </div>
    );
  }

  if (!priced) {
    return (
      <div aria-busy className="space-y-4">
        {lines.map((l) => (
          <div key={l.sku} className="h-28 animate-pulse rounded-lg bg-mist" />
        ))}
        {error && <p className="text-sm text-brand-strong">Could not load prices. Please reload the page.</p>}
      </div>
    );
  }

  const bySku = new Map(priced.lines.map((l) => [l.sku, l]));
  const unavailable = lines.filter((l) => priced.unavailable.includes(l.sku));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div>
        {unavailable.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            {unavailable.length === 1 ? "One item is" : `${unavailable.length} items are`} no longer available and will not be
            ordered.{" "}
            <button type="button" onClick={() => unavailable.forEach((l) => remove(l.sku))} className="font-semibold underline">
              Remove
            </button>
          </div>
        )}
        <ul className={`divide-y divide-line border-y border-line ${stale ? "opacity-70" : ""}`}>
          {lines.map((l) => {
            const p = bySku.get(l.sku);
            return p ? <CartRow key={l.sku} line={p} qty={l.qty} onQty={(q) => setQty(l.sku, q, p.maxQty)} onRemove={() => remove(l.sku)} /> : null;
          })}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Need a custom rope length, a sewn termination or a larger quantity?{" "}
          <Link href="/quote" className="font-semibold text-brand-strong hover:underline">
            Request a quote
          </Link>
          .
        </p>
      </div>

      <aside aria-label="Order summary" className="rounded-xl border border-line bg-mist p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg">Summary</h2>
        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt>Items</dt>
            <dd className="font-semibold tabular-nums">{eur(priced.itemsCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Shipping</dt>
            <dd className="text-right text-muted">Calculated at checkout</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-display tabular-nums">{eur(priced.itemsCents)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-xs text-muted">
            <dt>Incl. {Math.round(shop.vatRate * 100)}% VAT</dt>
            <dd className="tabular-nums">{eur(priced.vatCents)}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          aria-disabled={stale || !priced.lines.length}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-strong text-sm font-semibold text-white hover:bg-[#b5252a] aria-disabled:pointer-events-none aria-disabled:opacity-60"
        >
          Checkout
          <ArrowRight aria-hidden className="size-4" />
        </Link>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Pay by bank transfer against a proforma invoice. Company invoices with NUI available. All items are ordered from EDELRID on
          demand.
        </p>
      </aside>
    </div>
  );
}

function CartRow({ line, qty, onQty, onRemove }: { line: PricedLine; qty: number; onQty: (q: number) => void; onRemove: () => void }) {
  const metre = line.unit.kind === "metre";
  return (
    <li className="flex gap-4 py-5">
      <Link href={line.href} className="relative size-20 shrink-0 overflow-hidden rounded-md border border-line bg-white sm:size-24">
        {line.image && <Image src={line.image} alt="" fill sizes="96px" className="object-contain p-1.5" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <Link href={line.href} className="font-semibold leading-snug hover:text-brand-strong">
            {line.name}
          </Link>
          {line.optionsText && <p className="mt-0.5 text-sm text-muted">{line.optionsText}</p>}
          <p className="mt-0.5 text-xs text-muted">
            Item {line.sku} · {formatPrice(line.unitCents / 100)} {unitSuffix(line.unit)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2">
            <div className="flex h-10 items-center rounded-md border border-line">
              <button type="button" onClick={() => onQty(qty - 1)} disabled={qty <= 1} aria-label={`Decrease quantity of ${line.name}`} className="grid size-10 place-items-center text-muted hover:text-ink disabled:opacity-30">
                <Minus aria-hidden className="size-3.5" />
              </button>
              <input
                type="number"
                min={1}
                max={line.maxQty}
                value={qty}
                aria-label={metre ? `Metres of ${line.name}` : `Quantity of ${line.name}`}
                onChange={(e) => onQty(Number(e.target.value) || 1)}
                className="h-full w-12 border-x border-line text-center text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button type="button" onClick={() => onQty(qty + 1)} disabled={qty >= line.maxQty} aria-label={`Increase quantity of ${line.name}`} className="grid size-10 place-items-center text-muted hover:text-ink disabled:opacity-30">
                <Plus aria-hidden className="size-3.5" />
              </button>
            </div>
            {metre && <span className="text-xs text-muted">m</span>}
          </div>
          <div className="flex items-center gap-3">
            <p className="font-semibold tabular-nums">{formatPrice(line.lineCents / 100)}</p>
            <button type="button" onClick={onRemove} className="grid size-9 place-items-center rounded-md text-muted hover:bg-mist hover:text-brand-strong">
              <Trash2 aria-hidden className="size-4" />
              <span className="sr-only">Remove {line.name}</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
