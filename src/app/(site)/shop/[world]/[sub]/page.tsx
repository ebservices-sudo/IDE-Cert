import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSubcategory, getWorld, subcategoryHref, worldHref, worlds, type WorldSlug } from "@/config/catalog";
import { categoryCounts, getCatalog } from "@/lib/catalog/data";
import { buildListing, parseListingState } from "@/lib/catalog/listing";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageHeaderSkeleton } from "@/components/layout/PageHeaderSkeleton";
import { ListingSkeleton, ListingView } from "@/components/shop/ListingView";

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

export default function SubcategoryPage({ params, searchParams }: PageProps<"/shop/[world]/[sub]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeaderSkeleton />
          <ListingSkeleton />
        </>
      }
    >
      <SubcategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function SubcategoryContent({ params, searchParams }: PageProps<"/shop/[world]/[sub]">) {
  const { world: worldSlug, sub } = await params;
  const world = getWorld(worldSlug);
  const subcategory = getSubcategory(worldSlug, sub);
  if (!world || !subcategory) notFound();
  const count = categoryCounts[`${world.slug}/${subcategory.slug}`] ?? 0;

  return (
    <>
      <PageHeader
        kicker={world.name}
        title={subcategory.name}
        description={subcategory.blurb}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: world.name, href: worldHref(world.slug) },
          { label: subcategory.name },
        ]}
      >
        <p className="mt-5 text-sm text-muted-dark">
          <span className="font-semibold text-white tabular-nums">{count}</span> products · Prices incl. 18% VAT
        </p>
      </PageHeader>
      <Suspense fallback={<ListingSkeleton />}>
        <Results world={world.slug} sub={subcategory.slug} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Results({
  world,
  sub,
  searchParams,
}: {
  world: WorldSlug;
  sub: string;
  searchParams: PageProps<"/shop/[world]/[sub]">["searchParams"];
}) {
  const state = parseListingState(await searchParams, "popular");
  const listing = buildListing((await getCatalog()).productsIn(world, sub), state);
  return <ListingView listing={listing} basePath={subcategoryHref(world, sub)} />;
}
