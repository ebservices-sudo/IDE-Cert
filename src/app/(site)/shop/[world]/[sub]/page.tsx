import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubcategory, getWorld, subcategoryHref, worlds } from "@/config/catalog";
import { categoryGuide } from "@/config/shopGuide";
import { categoryCounts } from "@/lib/catalog/data";
import { getExplorerItems } from "@/lib/catalog/explorer-data";
import { Suspense } from "react";
import { ShopExplorer, ShopExplorerFromUrl } from "@/components/shop/ShopExplorer";

export function generateStaticParams() {
  return worlds.flatMap((w) => w.subcategories.map((s) => ({ world: w.slug, sub: s.slug })));
}

export async function generateMetadata({ params }: PageProps<"/shop/[world]/[sub]">): Promise<Metadata> {
  const { world, sub } = await params;
  const w = getWorld(world);
  const subcategory = getSubcategory(world, sub);
  if (!w || !subcategory) return {};
  return {
    title: `${subcategory.name} – EDELRID ${w.name}`,
    description: `${subcategory.blurb} ${categoryCounts[`${world}/${sub}`] ?? 0} EDELRID products, delivered across Kosovo and the Balkans.`,
    alternates: { canonical: subcategoryHref(w.slug, subcategory.slug) },
  };
}

export default async function SubcategoryPage({ params }: PageProps<"/shop/[world]/[sub]">) {
  const { world: worldSlug, sub } = await params;
  const world = getWorld(worldSlug);
  const subcategory = getSubcategory(worldSlug, sub);
  if (!world || !subcategory) notFound();
  const items = await getExplorerItems();
  const key = `${world.slug}/${subcategory.slug}`;
  const props = {
    items: items,
    initialWorld: world.slug,
    initialCat: key,
    kicker: `Shop · EDELRID ${world.name}`,
    title: subcategory.name,
    lede: categoryGuide[key]?.what ?? subcategory.blurb,
  };
  return (
    <Suspense key={key} fallback={<ShopExplorer {...props} />}>
      <ShopExplorerFromUrl {...props} />
    </Suspense>
  );
}
