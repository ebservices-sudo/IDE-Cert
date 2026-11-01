"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Minus, Plus, X } from "lucide-react";
import clsx from "clsx";
import { shop } from "@/config/site";
import { cartActions } from "@/lib/cart/store";
import { OPTION_LABELS, optionValues, type OptionDim } from "@/lib/catalog/options";
import type { PriceUnit, Variant, VariantOptions } from "@/lib/catalog/types";
import { formatPrice, unitSuffix } from "@/lib/format";
import { colourFill } from "./colours";

type QVariant = { sku: string; options: VariantOptions; price: number; unit: PriceUnit; isNew: boolean };
type QProduct = {
  slug: string;
  href: string;
  name: string;
  brand: string;
  catName: string;
  shortDescription: string;
  chips: string[];
  images: { src: string; alt: string; colour: string | null }[];
  variants: QVariant[];
  quoteNotes: string[];
};

const cache = new Map<string, QProduct>();

/** Product quick view: pick options, see the price and add the item to the request list. */
export function QuickView({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  // Loaded products by slug; the selection (variant + quantity) belongs to one slug and resets for another.
  const [loaded, setLoaded] = useState<Record<string, QProduct>>({});
  const [failed, setFailed] = useState<string | null>(null);
  const [pick, setPick] = useState<{ slug: string; sku: string | null; qty: number }>({ slug: "", sku: null, qty: 1 });
  const [toast, setToast] = useState<string | null>(null);

  const data = slug ? (loaded[slug] ?? cache.get(slug) ?? null) : null;
  const error = Boolean(slug) && failed === slug;
  const sku = pick.slug === slug ? pick.sku : null;
  const qty = pick.slug === slug ? pick.qty : 1;
  const setQty = (fn: number | ((q: number) => number)) =>
    setPick((p) => {
      const cur = p.slug === slug ? p.qty : 1;
      return { slug: slug ?? "", sku: p.slug === slug ? p.sku : null, qty: typeof fn === "function" ? fn(cur) : fn };
    });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (slug && !d.open) d.showModal();
    if (!slug && d.open) d.close();
    if (!slug || cache.has(slug)) return;
    const ctrl = new AbortController();
    fetch(`/api/product?slug=${encodeURIComponent(slug)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<QProduct>) : Promise.reject(r.status)))
      .then((p) => {
        cache.set(slug, p);
        setLoaded((m) => ({ ...m, [slug]: p }));
      })
      .catch(() => !ctrl.signal.aborted && setFailed(slug));
    return () => ctrl.abort();
  }, [slug]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const variant = data?.variants.find((v) => v.sku === sku) ?? data?.variants[0];
  const options = useMemo(() => (data ? optionValues(data.variants as unknown as Variant[]) : []), [data]);
  const dims = options.filter((o) => o.values.length > 1).map((o) => o.dim);

  const select = (dim: OptionDim, value: string) => {
    if (!data || !variant) return;
    const candidates = data.variants.filter((v) => v.options[dim] === value);
    const score = (v: QVariant) => dims.reduce((s, d, i) => s + (d !== dim && v.options[d] === variant.options[d] ? 2 ** (dims.length - i) : 0), 0);
    const best = [...candidates].sort((a, b) => score(b) - score(a))[0];
    if (best) {
      const resetQty = (best.unit.kind === "metre") !== (variant.unit.kind === "metre");
      setPick({ slug: slug ?? "", sku: best.sku, qty: resetQty ? 1 : qty });
    }
  };
  const matchesOthers = (v: QVariant, dim: OptionDim) => dims.filter((d) => d !== dim).every((d) => (v.options[d] ?? "") === (variant?.options[d] ?? ""));

  const perMetre = variant?.unit.kind === "metre";
  const maxQty = perMetre ? shop.maxCutLength : 99;
  const image = data && variant ? (data.images.find((i) => i.colour && i.colour === variant.options.colour) ?? data.images[0]) : undefined;

  const add = () => {
    if (!data || !variant) return;
    cartActions.add(variant.sku, data.slug, qty, maxQty);
    const opts = [variant.options.colour, variant.options.size, variant.options.length].filter(Boolean).join(" · ");
    setToast(`${data.name}${opts ? ` · ${opts}` : ""}`);
    onClose();
  };

  return (
    <>
      <dialog
        ref={ref}
        onClose={onClose}
        onClick={(e) => e.target === ref.current && onClose()}
        aria-label={data?.name ?? "Product"}
        className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-white p-0 text-ink backdrop:bg-black/50 sm:m-auto sm:max-h-[88dvh] sm:max-w-4xl sm:rounded-2xl"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full border border-line bg-white/90 hover:border-ink/40">
          <X aria-hidden className="size-4" />
        </button>
        {!data ? (
          <div className="grid min-h-80 place-items-center p-10 text-sm text-muted" aria-busy={!error}>
            {error ? (
              <p>
                Could not load this product.{" "}
                {slug && (
                  <Link href={`/shop?q=${encodeURIComponent(slug)}`} className="font-semibold text-brand-strong underline">
                    Try again
                  </Link>
                )}
              </p>
            ) : (
              <span className="size-8 animate-spin rounded-full border-2 border-line border-t-brand" />
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
            <div className="relative aspect-square bg-mist sm:aspect-auto sm:min-h-[26rem]">
              {image ? (
                <Image src={image.src} alt={image.alt} fill sizes="(min-width:640px) 400px, 100vw" className="object-contain p-8" />
              ) : (
                <p className="grid h-full place-items-center text-sm text-muted">No photo yet</p>
              )}
            </div>
            <div className="flex flex-col gap-5 p-5 sm:p-7">
              <div className="pr-10">
                <p className="kicker text-brand-strong">
                  {data.brand} · {data.catName}
                </p>
                <h2 className="mt-2 font-display text-2xl leading-tight">{data.name}</h2>
                {data.chips.length > 0 && <p className="mt-1.5 text-sm text-muted">{data.chips.join(" · ")}</p>}
              </div>

              {variant && (
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-3xl tabular-nums">{formatPrice(variant.price)}</span>
                    {unitSuffix(variant.unit) && <span className="font-semibold text-muted">{unitSuffix(variant.unit)}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Incl. {Math.round(shop.vatRate * 100)}% VAT · item {variant.sku}</p>
                </div>
              )}

              {options.map(({ dim, values }) =>
                values.length < 2 ? null : (
                  <fieldset key={dim}>
                    <legend className="text-sm font-semibold">
                      {OPTION_LABELS[dim]} <span className="ml-1 font-normal text-muted">{variant?.options[dim]}</span>
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {values.map((value) => {
                        const selected = variant?.options[dim] === value;
                        const available = data.variants.some((v) => v.options[dim] === value && matchesOthers(v, dim));
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => select(dim, value)}
                            className={clsx(
                              "inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-1.5 text-left text-sm font-medium transition-colors",
                              selected ? "border-ink bg-ink text-white" : "border-line hover:border-ink/50",
                              !available && !selected && "border-dashed text-muted",
                            )}
                          >
                            {dim === "colour" && <span aria-hidden className="size-4 rounded-full border border-ink/20" style={{ background: colourFill(value) }} />}
                            {dim === "config" && value.startsWith(`${data.name}, `) ? `+ ${value.slice(data.name.length + 2)}` : value}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ),
              )}

              <div className="mt-auto flex flex-wrap items-end gap-3">
                <div>
                  <p className="text-sm font-semibold">{perMetre ? "Metres" : "Quantity"}</p>
                  <div className="mt-1.5 flex h-12 items-center rounded-md border border-line">
                    <button type="button" aria-label="Less" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-12 place-items-center text-muted hover:text-ink">
                      <Minus aria-hidden className="size-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={maxQty}
                      value={qty}
                      aria-label={perMetre ? "Metres" : "Quantity"}
                      onChange={(e) => setQty(Math.min(maxQty, Math.max(1, Math.round(Number(e.target.value) || 1))))}
                      className="h-full w-14 border-x border-line text-center font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="grid size-12 place-items-center text-muted hover:text-ink">
                      <Plus aria-hidden className="size-4" />
                    </button>
                  </div>
                </div>
                <button type="button" onClick={add} disabled={!variant} className="inline-flex h-12 min-w-52 flex-1 items-center justify-center gap-2 rounded-md bg-brand-strong px-5 text-sm font-semibold text-white transition-colors hover:bg-[#b5252a] disabled:opacity-50">
                  Add to request
                  {variant && <span className="tabular-nums">· {formatPrice(variant.price * qty)}</span>}
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                <p className="text-muted">No payment now. We confirm price and delivery by email.</p>
                <Link href={variant ? `${data.href}?sku=${variant.sku}` : data.href} className="inline-flex items-center gap-1.5 font-semibold hover:text-brand-strong">
                  Full details
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </dialog>

      <div
        role="status"
        aria-live="polite"
        className={clsx(
          "fixed inset-x-4 bottom-5 z-50 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-2xl transition-[opacity,translate] duration-300",
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        {toast && (
          <>
            <Check aria-hidden className="size-4 shrink-0 text-brand" />
            <span className="min-w-0">
              Added to your request: <span className="font-semibold">{toast}</span>
            </span>
            <Link href="/cart" className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 font-semibold hover:bg-white/20">
              View request
            </Link>
          </>
        )}
      </div>
    </>
  );
}
