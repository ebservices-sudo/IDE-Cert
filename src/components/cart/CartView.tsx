"use client";

import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Minus, Plus, Trash2 } from "lucide-react";
import { cartActions } from "@/lib/cart/store";
import { RequestForm } from "./RequestForm";
import { T } from "@/lib/i18n/T";
import { useLang } from "@/lib/i18n/useLang";
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
        <ClipboardList aria-hidden className="mx-auto size-8 text-muted" />
        <p className="mt-4 font-semibold">
          <T sq="Lista juaj e kërkesës është bosh." en="Your request list is empty." />
        </p>
        <p className="mt-1 text-sm text-muted">
          <T sq="Hapni një produkt në dyqan dhe shtypni “Shto në kërkesë”." en="Open a product in the shop and press “Add to request”." />
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="inline-flex h-11 items-center rounded-md bg-brand-strong px-5 text-sm font-semibold text-white hover:bg-[#b5252a]">
            <T sq="Shiko dyqanin" en="Browse the shop" />
          </Link>
          <Link href="/quote" className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm font-semibold hover:border-ink/40">
            <T sq="Përshkruani çfarë ju duhet" en="Describe what you need" />
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
        {error && (
          <p className="text-sm text-brand-strong">
            <T sq="Çmimet nuk u ngarkuan. Ju lutemi ringarkoni faqen." en="Could not load prices. Please reload the page." />
          </p>
        )}
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
            <T
              sq={`${unavailable.length === 1 ? "Një artikull nuk" : `${unavailable.length} artikuj nuk`} ofrohen më dhe nuk do të kërkohen.`}
              en={`${unavailable.length === 1 ? "One item is" : `${unavailable.length} items are`} no longer available and will not be requested.`}
            />{" "}
            <button type="button" onClick={() => unavailable.forEach((l) => remove(l.sku))} className="font-semibold underline">
              <T sq="Hiqi" en="Remove" />
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
          <T sq="Ju duhet gjatësi e veçantë litari, skaj i qepur ose sasi më e madhe?" en="Need a custom rope length, a sewn termination or a larger quantity?" />{" "}
          <Link href="/quote" className="font-semibold text-brand-strong hover:underline">
            <T sq="Kërko ofertë" en="Request a quote" />
          </Link>
          .
        </p>
      </div>

      <aside aria-label="Request summary" className="rounded-xl border border-line bg-mist p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg">
          <T sq="Dërgoni kërkesën" en="Send your request" />
        </h2>
        <dl className="mt-4 space-y-2 border-b border-line pb-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt>
              {priced.lines.length} <T sq={priced.lines.length === 1 ? "artikull, i përafërt" : "artikuj, të përafërt"} en={priced.lines.length === 1 ? "item, estimated" : "items, estimated"} />
            </dt>
            <dd className="font-display text-base tabular-nums">{eur(priced.itemsCents)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-xs text-muted">
            <dt>
              <T sq={`Me TVSH ${Math.round(shop.vatRate * 100)}% · transporti konfirmohet në përgjigjen tonë`} en={`Incl. ${Math.round(shop.vatRate * 100)}% VAT · shipping confirmed in our reply`} />
            </dt>
            <dd className="tabular-nums">{eur(priced.vatCents)}</dd>
          </div>
        </dl>
        <div className={`mt-5 ${stale ? "pointer-events-none opacity-60" : ""}`}>
          <RequestForm lines={priced.lines} onSent={cartActions.clear} />
        </div>
      </aside>
    </div>
  );
}

function CartRow({ line, qty, onQty, onRemove }: { line: PricedLine; qty: number; onQty: (q: number) => void; onRemove: () => void }) {
  const { t } = useLang();
  const metre = line.unit.kind === "metre";
  return (
    <li className="flex gap-4 py-5">
      <Link href={line.href} className="relative size-20 shrink-0 overflow-hidden rounded-md border border-line bg-mist sm:size-24">
        {line.image && <Image src={line.image} alt="" fill sizes="96px" className="object-contain p-1.5 mix-blend-multiply" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <Link href={line.href} className="font-semibold leading-snug hover:text-brand-strong">
            {line.name}
          </Link>
          {line.optionsText && <p className="mt-0.5 text-sm text-muted">{line.optionsText}</p>}
          <p className="mt-0.5 text-xs text-muted">
            <T sq="Artikulli" en="Item" /> {line.sku} · {formatPrice(line.unitCents / 100)} {unitSuffix(line.unit)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2">
            <div className="flex h-10 items-center rounded-md border border-line">
              <button type="button" onClick={() => onQty(qty - 1)} disabled={qty <= 1} aria-label={t(`Ul sasinë: ${line.name}`, `Decrease quantity of ${line.name}`)} className="grid size-10 place-items-center text-muted hover:text-ink disabled:opacity-30">
                <Minus aria-hidden className="size-3.5" />
              </button>
              <input
                type="number"
                min={1}
                max={line.maxQty}
                value={qty}
                aria-label={metre ? t(`Metra: ${line.name}`, `Metres of ${line.name}`) : t(`Sasia: ${line.name}`, `Quantity of ${line.name}`)}
                onChange={(e) => onQty(Number(e.target.value) || 1)}
                className="h-full w-12 border-x border-line text-center text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button type="button" onClick={() => onQty(qty + 1)} disabled={qty >= line.maxQty} aria-label={t(`Rrit sasinë: ${line.name}`, `Increase quantity of ${line.name}`)} className="grid size-10 place-items-center text-muted hover:text-ink disabled:opacity-30">
                <Plus aria-hidden className="size-3.5" />
              </button>
            </div>
            {metre && <span className="text-xs text-muted">m</span>}
          </div>
          <div className="flex items-center gap-3">
            <p className="font-semibold tabular-nums">{formatPrice(line.lineCents / 100)}</p>
            <button type="button" onClick={onRemove} className="grid size-9 place-items-center rounded-md text-muted hover:bg-mist hover:text-brand-strong">
              <Trash2 aria-hidden className="size-4" />
              <span className="sr-only">
                <T sq={`Hiq ${line.name}`} en={`Remove ${line.name}`} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
