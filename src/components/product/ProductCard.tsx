import Link from "next/link";
import type { CardData } from "@/lib/catalog/cards";
import { ProductImage } from "./ProductImage";

export function ProductCard({ card, preload = false }: { card: CardData; preload?: boolean }) {
  return (
    <Link href={card.href} className="group flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white transition-colors group-hover:border-ink/25">
        <ProductImage
          src={card.image?.src}
          alt={card.image?.alt ?? card.name}
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 33vw, 50vw"
          preload={preload}
        />
        {card.isNew && (
          <span className="absolute left-3 top-3 rounded bg-brand-strong px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
            New
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="kicker text-[0.65rem] text-muted">{card.brand}</p>
        <h3 className="mt-1 font-semibold leading-snug transition-colors group-hover:text-brand-strong">{card.name}</h3>
        {card.chips.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {card.chips.map((chip) => (
              <li key={chip} className="rounded border border-line px-1.5 py-0.5 text-[11px] font-medium text-muted">
                {chip}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="font-semibold tabular-nums">{card.price}</p>
          {card.colours > 1 && <p className="shrink-0 text-xs text-muted">{card.colours} colours</p>}
        </div>
      </div>
    </Link>
  );
}
