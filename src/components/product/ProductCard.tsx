import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { productHref } from "@/lib/catalog/urls";
import { formatPriceRange } from "@/lib/format";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product, preload = false }: { product: Product; preload?: boolean }) {
  const image = product.images[0];
  const colours = new Set(product.variants.map((v) => v.options.colour).filter(Boolean)).size;
  return (
    <Link href={productHref(product)} className="group flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white transition-colors group-hover:border-ink/25">
        <ProductImage
          src={image?.src}
          alt={image?.alt ?? product.name}
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 33vw, 50vw"
          preload={preload}
        />
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded bg-brand-strong px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
            New
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="kicker text-[0.65rem] text-muted">{product.brand}</p>
        <h3 className="mt-1 font-semibold leading-snug transition-colors group-hover:text-brand-strong">{product.name}</h3>
        {product.chips && product.chips.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {product.chips.map((chip) => (
              <li key={chip} className="rounded border border-line px-1.5 py-0.5 text-[11px] font-medium text-muted">
                {chip}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="font-semibold tabular-nums">{formatPriceRange(product)}</p>
          {colours > 1 && <p className="shrink-0 text-xs text-muted">{colours} colours</p>}
        </div>
      </div>
    </Link>
  );
}
