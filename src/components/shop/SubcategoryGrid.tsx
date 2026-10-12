import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { subcategoryHref, type World } from "@/config/catalog";

/** Subcategory tiles with product counts; empty subcategories are left out. */
export function SubcategoryGrid({ world, counts }: { world: World; counts: Record<string, number> }) {
  const subs = world.subcategories.filter((s) => (counts[`${world.slug}/${s.slug}`] ?? 0) > 0);
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {subs.map((sub) => (
        <li key={sub.slug}>
          <Link
            href={subcategoryHref(world.slug, sub.slug)}
            className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 transition-colors hover:border-ink/30"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="font-display text-base leading-snug">{sub.name}</span>
              <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted group-hover:text-brand-strong" />
            </span>
            <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{sub.blurb}</span>
            <span className="mt-4 text-xs font-semibold tabular-nums text-muted">
              {counts[`${world.slug}/${sub.slug}`]} products
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
