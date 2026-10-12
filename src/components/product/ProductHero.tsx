"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Check, FileText, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { shop } from "@/config/site";
import { useCart } from "@/lib/cart/store";
import { OPTION_LABELS, type OptionDim, optionValues } from "@/lib/catalog/options";
import type { Product, Variant } from "@/lib/catalog/types";
import { formatPrice, unitSuffix } from "@/lib/format";
import { ProductImage } from "./ProductImage";

export type HeroProduct = Pick<Product, "slug" | "name" | "brand" | "isNew" | "variants" | "images" | "shortDescription"> & {
  subcategoryName: string;
  quoteNotes: string[];
  manualUrl?: string;
};

/** Reads ?sku= so links to a specific variant (e.g. from the cart) preselect it. */
export function ProductHeroFromUrl({ product }: { product: HeroProduct }) {
  const sku = useSearchParams().get("sku");
  return <ProductHero product={product} initialSku={sku} />;
}

export function ProductHero({ product, initialSku }: { product: HeroProduct; initialSku: string | null }) {
  const [sku, setSku] = useState(
    () => product.variants.find((v) => v.sku === initialSku)?.sku ?? product.variants[0].sku,
  );
  const variant = product.variants.find((v) => v.sku === sku) ?? product.variants[0];

  const choose = (v: Variant) => {
    setSku(v.sku);
    const url = new URL(window.location.href);
    url.searchParams.set("sku", v.sku);
    window.history.replaceState(window.history.state, "", url);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
      <Gallery images={product.images} colour={variant.options.colour} name={product.name} />
      <PurchasePanel product={product} variant={variant} onChoose={choose} />
    </div>
  );
}

// --- gallery ---------------------------------------------------------------

function Gallery({ images, colour, name }: { images: Product["images"]; colour?: string; name: string }) {
  // One hero photo per colour, then extra views. Show the chosen colour's hero first.
  const shown = useMemo(() => {
    const seen = new Set<string | undefined>();
    const heroes: typeof images = [];
    const extras: typeof images = [];
    for (const im of images) {
      if (!seen.has(im.colour)) {
        seen.add(im.colour);
        heroes.push(im);
      } else extras.push(im);
    }
    const hero = heroes.find((h) => h.colour === colour) ?? heroes[0];
    return hero ? [hero, ...extras] : [];
  }, [images, colour]);

  const [active, setActive] = useState(0);
  const [forColour, setForColour] = useState(colour);
  if (forColour !== colour) {
    setForColour(colour);
    setActive(0);
  }
  const current = shown[Math.min(active, shown.length - 1)];

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-white">
        <ProductImage
          src={current?.src}
          alt={current?.alt ?? name}
          sizes="(min-width: 1024px) 45vw, 100vw"
          preload
          className="object-contain p-6 sm:p-10"
        />
      </div>
      {shown.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">
          {shown.map((im, i) => (
            <li key={im.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${shown.length}`}
                aria-current={i === active}
                className={clsx(
                  "relative block size-16 overflow-hidden rounded-md border bg-white sm:size-20",
                  i === active ? "border-ink" : "border-line hover:border-ink/40",
                )}
              >
                <Image src={im.src} alt="" fill sizes="80px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- purchase panel --------------------------------------------------------

function PurchasePanel({
  product,
  variant,
  onChoose,
}: {
  product: HeroProduct;
  variant: Variant;
  onChoose: (v: Variant) => void;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState<string | null>(null);
  const options = useMemo(() => optionValues(product.variants), [product.variants]);
  // Only options with a choice take part in matching; single values are shown as information.
  const dims = options.filter((o) => o.values.length > 1).map((o) => o.dim);
  const shortLabel = (dim: OptionDim, value: string) => {
    if (dim !== "config") return value;
    const prefix = `${product.name}, `;
    return value.startsWith(prefix) ? `+ ${value.slice(prefix.length)}` : value;
  };
  const perMetre = variant.unit.kind === "metre";
  const maxQty = perMetre ? shop.maxCutLength : 99;
  const net = variant.price / (1 + shop.vatRate);
  const colourImage = (c: string) => product.images.find((im) => im.colour === c)?.src;

  const matchesOthers = (v: Variant, dim: OptionDim) =>
    dims.filter((d) => d !== dim).every((d) => (v.options[d] ?? "") === (variant.options[d] ?? ""));

  const select = (dim: OptionDim, value: string) => {
    const candidates = product.variants.filter((v) => v.options[dim] === value);
    // Keep the other choices where possible, in option order.
    const score = (v: Variant) =>
      dims.reduce((s, d, i) => s + (d !== dim && v.options[d] === variant.options[d] ? 2 ** (dims.length - i) : 0), 0);
    const best = [...candidates].sort((a, b) => score(b) - score(a))[0];
    if (best) {
      onChoose(best);
      if ((best.unit.kind === "metre") !== perMetre) setQty(1);
      setAdded(null);
    }
  };

  const addToCart = () => {
    add(variant.sku, product.slug, qty, maxQty);
    setAdded(variant.sku);
  };

  return (
    <div>
      <p className="kicker text-brand-strong">
        {product.brand} · {product.subcategoryName}
      </p>
      <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{product.name}</h1>
      {product.shortDescription && <p className="mt-3 text-base leading-relaxed text-muted">{product.shortDescription}</p>}

      <div className="mt-6 border-t border-line pt-6">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-3xl tabular-nums">{formatPrice(variant.price)}</span>
          {unitSuffix(variant.unit) && <span className="text-base font-semibold text-muted">{unitSuffix(variant.unit)}</span>}
          {variant.isNew && (
            <span className="ml-1 self-center rounded bg-brand-strong px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              New 2026
            </span>
          )}
        </p>
        <p className="mt-1 text-sm text-muted">
          Incl. {Math.round(shop.vatRate * 100)}% VAT · <span className="tabular-nums">{formatPrice(net)}</span> excl. VAT
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {options.map(({ dim, values }) =>
          values.length === 1 && !variant.options[dim] ? null : (
          <fieldset key={dim}>
            <legend className="text-sm font-semibold">
              {OPTION_LABELS[dim]}
              {values.length > 1 && <span className="ml-2 font-normal text-muted">{variant.options[dim]}</span>}
            </legend>
            {values.length === 1 ? (
              <p className="mt-1.5 text-sm text-muted">{values[0]}</p>
            ) : (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {values.map((value) => {
                  const selected = variant.options[dim] === value;
                  const available = product.variants.some((v) => v.options[dim] === value && matchesOthers(v, dim));
                  const img = dim === "colour" ? colourImage(value) : undefined;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => select(dim, value)}
                      title={available ? undefined : "Not available with the current selection — selecting it changes the other options"}
                      className={clsx(
                        "inline-flex min-h-10 max-w-full items-center gap-2 rounded-md border px-3 py-1.5 text-left text-sm font-medium transition-colors",
                        selected ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/50",
                        !available && !selected && "border-dashed text-muted",
                      )}
                    >
                      {img && (
                        <span className="relative size-7 shrink-0 overflow-hidden rounded bg-white">
                          <Image src={img} alt="" fill sizes="28px" className="object-contain" />
                        </span>
                      )}
                      {shortLabel(dim, value)}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
          ),
        )}
      </div>

      <div className="mt-7 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="qty" className="block text-sm font-semibold">
            {perMetre ? "Length in metres" : "Quantity"}
          </label>
          <div className="mt-2 flex h-12 items-center rounded-md border border-line">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid size-12 place-items-center text-muted hover:text-ink"
              aria-label="Decrease"
            >
              <Minus aria-hidden className="size-4" />
            </button>
            <input
              id="qty"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxQty}
              value={qty}
              onChange={(e) => setQty(Math.min(maxQty, Math.max(1, Math.round(Number(e.target.value) || 1))))}
              className="h-full w-16 border-x border-line text-center font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="grid size-12 place-items-center text-muted hover:text-ink"
              aria-label="Increase"
            >
              <Plus aria-hidden className="size-4" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={addToCart}
          className="inline-flex h-12 min-w-48 flex-1 items-center justify-center gap-2 rounded-md bg-brand-strong px-6 text-sm font-semibold text-white transition-colors hover:bg-[#b5252a]"
        >
          <ShoppingBag aria-hidden className="size-4" />
          Add to cart · <span className="tabular-nums">{formatPrice(variant.price * qty)}</span>
        </button>
      </div>
      {perMetre && (
        <p className="mt-2 text-sm text-muted">
          Cut to length from the spool, priced per metre. Up to {shop.maxCutLength} m per line.
        </p>
      )}
      <p role="status" className="mt-3 min-h-6 text-sm">
        {added === variant.sku && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
            <Check aria-hidden className="size-4 text-brand-strong" />
            Added to your cart.
            <Link href="/cart" className="text-brand-strong hover:underline">
              View cart
            </Link>
          </span>
        )}
      </p>

      <dl className="mt-4 divide-y divide-line rounded-lg border border-line text-sm">
        <div className="flex items-start gap-3 p-4">
          <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
          <div>
            <dt className="font-semibold">Ordered on demand from EDELRID</dt>
            <dd className="mt-0.5 text-muted">
              {shop.leadTime ? `Usual delivery time: ${shop.leadTime}.` : "We confirm the delivery date by email after you order."} Delivery
              across Kosovo and the Balkans.
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <FileText aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
          <div>
            <dt className="font-semibold">Item number {variant.sku}</dt>
            <dd className="mt-0.5 text-muted">
              Company invoice with your NUI available at checkout.
              {product.quoteNotes.length > 0 && (
                <>
                  {" "}
                  {product.quoteNotes.join(" ")}{" "}
                  <Link href={`/quote?sku=${variant.sku}`} className="font-semibold text-brand-strong hover:underline">
                    Request a quote
                  </Link>
                </>
              )}
            </dd>
          </div>
        </div>
      </dl>
      {product.manualUrl && (
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Personal protective equipment. Read the{" "}
          <a href={product.manualUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            EDELRID user manual
          </a>{" "}
          before use.
        </p>
      )}
    </div>
  );
}
