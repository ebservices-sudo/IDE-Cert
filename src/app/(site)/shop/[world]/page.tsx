import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorld, worldHref, worlds } from "@/config/catalog";
import { getExplorerItems } from "@/lib/catalog/explorer-data";
import { Suspense } from "react";
import { T } from "@/lib/i18n/T";
import { ShopExplorer, ShopExplorerFromUrl } from "@/components/shop/ShopExplorer";

export function generateStaticParams() {
  return worlds.map((w) => ({ world: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[world]">): Promise<Metadata> {
  const world = getWorld((await params).world);
  if (!world) return {};
  return {
    title: `EDELRID ${world.name} equipment`,
    description: world.description,
    alternates: { canonical: worldHref(world.slug) },
  };
}

export default async function WorldPage({ params }: PageProps<"/shop/[world]">) {
  const world = getWorld((await params).world);
  if (!world) notFound();
  const items = await getExplorerItems();
  const props = {
    items: items,
    initialWorld: world.slug,
    kicker: <T sq={`Dyqani · ${world.taglineSq}`} en={`Shop · ${world.tagline}`} />,
    title: <T sq={`EDELRID ${world.nameSq}`} en={`EDELRID ${world.name}`} />,
    lede: <T sq={world.descriptionSq} en={world.description} />,
  };
  return (
    <Suspense key={world.slug} fallback={<ShopExplorer {...props} />}>
      <ShopExplorerFromUrl {...props} />
    </Suspense>
  );
}
